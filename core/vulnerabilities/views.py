from django.shortcuts import render
from django.http import JsonResponse
import csv
import io
from django.db.models import Count, Avg, Q
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from .models import Device, Vendor, Type, Vulnerability, attack_vector, attack_complexity, privileges_required, user_interaction, scope, confidentiality, integrity, availability
from .filters import data_by_filters
from collections import defaultdict
import traceback


@csrf_exempt
def parse_vector_string(vector_string: str) -> dict:
    # Удаляем префикс CVSS:3.X/
    vector_string = vector_string.strip()
    if vector_string.startswith("CVSS:"):
        vector_string = vector_string.split("/", 1)[-1]  # Обрезаем всё до первой /
    
    result = {}
    for item in vector_string.split("/"):
        if ":" in item:
            key, value = item.split(":", 1)
            result[key] = value
    return result

@csrf_exempt
def upload_csv(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        decoded_file = file.read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded_file), delimiter=';')

        created = 0
        for row in reader:
            try:
                cleaned_row = {k.strip(): (v.strip() if v else "") for k, v in row.items()}

                if cleaned_row.get("Type", "").lower() == "unknown":
                    continue

                vector = parse_vector_string(cleaned_row.get("VectorString", ""))

                av = attack_vector.objects.get_or_create(name=vector.get("AV", cleaned_row.get("attack_vector", "")))[0]
                ac = attack_complexity.objects.get_or_create(name=vector.get("AC", cleaned_row.get("attack_complexity", "")))[0]
                pr = privileges_required.objects.get_or_create(name=vector.get("PR", cleaned_row.get("privileges_required", "")))[0]
                ui = user_interaction.objects.get_or_create(name=vector.get("UI", cleaned_row.get("user_interaction", "")))[0]
                sc = scope.objects.get_or_create(name=vector.get("S", cleaned_row.get("scope", "")))[0]
                cf = confidentiality.objects.get_or_create(name=vector.get("C", cleaned_row.get("confidentiality", "")))[0]
                it = integrity.objects.get_or_create(name=vector.get("I", cleaned_row.get("integrity", "")))[0]
                avl = availability.objects.get_or_create(name=vector.get("A", cleaned_row.get("availability", "")))[0]
                vendor = Vendor.objects.get_or_create(name=cleaned_row["Vendor"])[0]
                type_ = Type.objects.get_or_create(name=cleaned_row["Type"])[0]
                device = Device.objects.get_or_create(name=cleaned_row["Device"], vendor=vendor, type=type_)[0]

                try:
                    vuln, _ = Vulnerability.objects.get_or_create(
                        cve=cleaned_row["CVE"],
                        defaults={
                            "BaseScore": cleaned_row["BaseScore"],
                            "ExploitabilityScore": cleaned_row["ExploitabilityScore"],
                            "ImpactScore": cleaned_row["ImpactScore"],
                            "attack_vector": av,
                            "attack_complexity": ac,
                            "privileges_required": pr,
                            "user_interaction": ui,
                            "scope": sc,
                            "confidentiality": cf,
                            "integrity": it,
                            "availability": avl,
                        }
                    )
                except IntegrityError:
                    continue  # или логируй, если хочешь видеть, какие записи были пропущены
                device.Vulnerabilities.add(vuln)
                created += 1
            except Exception as e:
                return JsonResponse({"error": str(e)}, status=400)

        return JsonResponse({"message": f"Успешно загружено: {created} записей"})

    return JsonResponse({"error": "Нет файла в запросе"}, status=400)


def count_vulnerabilities_by_vendor(request):
    try:
        vuln_filter, device_filter = data_by_filters(request)
        devices = Device.objects.filter(device_filter)
        result = {}
        for vendor in Vendor.objects.all():
            vendor_devices = devices.filter(vendor=vendor)
            vulnerabilities = Vulnerability.objects.filter(vuln_filter, device__in=vendor_devices).distinct()
            result[vendor.name] = vulnerabilities.count()
        
        return JsonResponse(result)
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

def count_vulnerabilities_by_type(request):
    try:
        vuln_filter, device_filter = data_by_filters(request)
        devices = Device.objects.filter(device_filter)
        result = {}
        for device_type in Type.objects.all():
            type_devices = devices.filter(type=device_type)
            vulnerabilities = Vulnerability.objects.filter(vuln_filter, device__in=type_devices).distinct()
            result[device_type.name] = vulnerabilities.count()
        
        return JsonResponse(result)
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

def top_10_devices_by_base_score(request):
    try:
        vuln_filter, device_filter = data_by_filters(request)

        filtered_vulns = Vulnerability.objects.filter(vuln_filter)

        devices = (
            Device.objects
            .filter(device_filter)
            .annotate(
                avg_base_score=Avg('Vulnerabilities__BaseScore', filter=Q(Vulnerabilities__in=filtered_vulns)),
                avg_exploitability_score=Avg('Vulnerabilities__ExploitabilityScore', filter=Q(Vulnerabilities__in=filtered_vulns)),
                avg_impact_score=Avg('Vulnerabilities__ImpactScore', filter=Q(Vulnerabilities__in=filtered_vulns)),
                vuln_count=Count('Vulnerabilities', filter=Q(Vulnerabilities__in=filtered_vulns))
            )
            .select_related('type', 'vendor')
            .distinct()
        )

        type_device_map = defaultdict(lambda: {'top': [], 'bottom': []})

        for dtype in Type.objects.all():
            typed_devices = [d for d in devices if d.type == dtype]

            # Заменим None на 0 явно (для стабильности)
            for d in typed_devices:
                if d.avg_base_score is None:
                    d.avg_base_score = 0

            total = len(typed_devices)
            if total == 0:
                continue

            # Сортируем по убыванию
            sorted_desc = sorted(typed_devices, key=lambda d: d.avg_base_score, reverse=True)
            # Сортируем по возрастанию
            sorted_asc = sorted(typed_devices, key=lambda d: d.avg_base_score)

            if total <= 10:
                # Все устройства идут в bottom (по возрастанию)
                type_device_map[dtype.name]['bottom'] = [
                    {
                        'device': d.name,
                        'avg_base_score': round(d.avg_base_score, 2),
                        'avg_exploitability_score': round(d.avg_exploitability_score or 0, 2),
                        'avg_impact_score': round(d.avg_impact_score or 0, 2),
                        'vuln_count': d.vuln_count,
                    }
                    for d in sorted_asc
                ]
            else:
                # Топ 10: только устройства с base_score > 0
                top_10 = [d for d in sorted_desc if d.avg_base_score > 0][:10]

                # Bottom 10 (можно с 0)
                bottom_candidates = [d for d in sorted_asc if d not in top_10][:10]

                type_device_map[dtype.name]['top'] = [
                    {
                        'device': d.name,
                        'avg_base_score': round(d.avg_base_score, 2),
                        'avg_exploitability_score': round(d.avg_exploitability_score or 0, 2),
                        'avg_impact_score': round(d.avg_impact_score or 0, 2),
                        'vuln_count': d.vuln_count,
                    }
                    for d in top_10
                ]

                type_device_map[dtype.name]['bottom'] = [
                    {
                        'device': d.name,
                        'avg_base_score': round(d.avg_base_score, 2),
                        'avg_exploitability_score': round(d.avg_exploitability_score or 0, 2),
                        'avg_impact_score': round(d.avg_impact_score or 0, 2),
                        'vuln_count': d.vuln_count,
                    }
                    for d in bottom_candidates
                ]

        return JsonResponse(type_device_map)

    except Exception as e:
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)