from django.shortcuts import render
from django.http import JsonResponse
import csv
import io
from django.db.models import Count, Q
from django.views.decorators.csrf import csrf_exempt
from .models import Device, Vendor, Type, Vulnerability, attack_vector, attack_complexity, privileges_required, user_interaction, scope, confidentiality, integrity, availability
from .filters import data_by_filters


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

                device.Vulnerabilities.add(vuln)
                created += 1
            except Exception as e:
                return JsonResponse({"error": str(e)}, status=400)

        return JsonResponse({"message": f"Успешно загружено: {created} записей"})

    return JsonResponse({"error": "Нет файла в запросе"}, status=400)

def get_filter_options(request):
    vendors = list(Vendor.objects.values_list('name', flat=True).distinct())
    types = list(Type.objects.values_list('name', flat=True).distinct())

    attack_vectors = list(attack_vector.objects.values_list('name', flat=True).distinct())
    attack_complexitys = list(attack_complexity.objects.values_list('name', flat=True).distinct())
    privileges_requireds = list(privileges_required.objects.values_list('name', flat=True).distinct())
    user_interactions = list(user_interaction.objects.values_list('name', flat=True).distinct())
    scopes = list(scope.objects.values_list('name', flat=True).distinct())
    confidentialitys = list(confidentiality.objects.values_list('name', flat=True).distinct())
    integritys = list(integrity.objects.values_list('name', flat=True).distinct())
    availabilitys = list(availability.objects.values_list('name', flat=True).distinct())

    data = {
        "vendors": vendors,
        "types": types,
        "attack_vectors": attack_vectors,
        "attack_complexitys": attack_complexitys,
        "privileges_requireds": privileges_requireds,
        "user_interactions": user_interactions,
        "scopes": scopes,
        "confidentialitys": confidentialitys,
        "integritys": integritys,
        "availabilitys": availabilitys
    }

    return JsonResponse(data)

def count_vulnerabilities_by_vendor(request):
    print("Полученные GET-параметры:")
    vuln_filter, device_filter = data_by_filters(request)
    for k, v in request.GET.lists():
        print(f"{k} = {v}")

    print("Кол-во Vulnerability ДО фильтрации:", Vulnerability.objects.count())
    print("Кол-во Device ДО фильтрации:", Device.objects.count())
    print("Сформированный vuln_filter:", vuln_filter)
    print("Сформированный device_filter:", device_filter)

    vulns = Vulnerability.objects.filter(vuln_filter)
    print("Кол-во Vulnerability ПОСЛЕ фильтрации:", vulns.count())
    devices = Device.objects.filter(device_filter)
    print("Кол-во Device ПОСЛЕ фильтрации:", devices.count())

    result = {}
    for vendor in Vendor.objects.all():
        vendor_devices = devices.filter(vendor=vendor)
        vulnerabilities = Vulnerability.objects.filter(vuln_filter, device__in=vendor_devices).distinct()
        result[vendor.name] = vulnerabilities.count()
    
    return JsonResponse(result)
