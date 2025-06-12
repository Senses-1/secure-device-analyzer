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
    # Удаляем префикс CVSS:3.1/
    if vector_string.startswith("CVSS:"):
        parts = vector_string.split("/")
        parts = parts[1:] if len(parts) > 1 else []
    else:
        parts = vector_string.split("/")

    result = {}
    for item in parts:
        if ":" in item:
            key, value = item.split(":")
            result[key] = value
    return result

@csrf_exempt
def upload_csv(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        decoded_file = file.read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded_file))

        created = 0
        for row in reader:
            try:
                vector = parse_vector_string(row.get("vector", ""))

                av = attack_vector.objects.get_or_create(name=vector.get("AV", row.get("attack_vector", "")))[0]
                ac = attack_complexity.objects.get_or_create(name=vector.get("AC", row.get("attack_complexity", "")))[0]
                pr = privileges_required.objects.get_or_create(name=vector.get("PR", row.get("privileges_required", "")))[0]
                ui = user_interaction.objects.get_or_create(name=vector.get("UI", row.get("user_interaction", "")))[0]
                sc = scope.objects.get_or_create(name=vector.get("S", row.get("scope", "")))[0]
                cf = confidentiality.objects.get_or_create(name=vector.get("C", row.get("confidentiality", "")))[0]
                it = integrity.objects.get_or_create(name=vector.get("I", row.get("integrity", "")))[0]
                avl = availability.objects.get_or_create(name=vector.get("A", row.get("availability", "")))[0]
                vendor = Vendor.objects.get_or_create(name=row[" Vendor"])[0]
                type_ = Type.objects.get_or_create(name=row[" Type"])[0]
                device = Device.objects.get_or_create(name=row["Device"], vendor=vendor, type=type_)[0]

                vuln, _ = Vulnerability.objects.get_or_create(
                    cve=row[" CVE"],
                    defaults={
                        "BaseScore": row[" BaseScore"],
                        "ExploitabilityScore": row[" ExploitabilityScore"],
                        "ІmpactScore": row[" ІmpactScore"],
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
    devices = list(Device.objects.values_list('name', flat=True).distinct())
    vendors = list(Vendor.objects.values_list('name', flat=True).distinct())
    types = list(Type.objects.values_list('name', flat=True).distinct())
    
    base_scores = list(Vulnerability.objects.values_list('BaseScore', flat=True).distinct())
    base_severities = list(Vulnerability.objects.values_list('BaseSeverity', flat=True).distinct())
    exploitability_scores = list(Vulnerability.objects.values_list('ExploitabilityScore', flat=True).distinct())
    impact_scores = list(Vulnerability.objects.values_list('ІmpactScore', flat=True).distinct())

    attack_vectors = list(attack_vector.objects.values_list('name', flat=True).distinct())
    attack_complexitys = list(attack_complexity.objects.values_list('name', flat=True).distinct())
    privileges_requireds = list(privileges_required.objects.values_list('name', flat=True).distinct())
    user_interactions = list(user_interaction.objects.values_list('name', flat=True).distinct())
    scopes = list(scope.objects.values_list('name', flat=True).distinct())
    confidentialitys = list(confidentiality.objects.values_list('name', flat=True).distinct())
    integritys = list(integrity.objects.values_list('name', flat=True).distinct())
    availabilitys = list(availability.objects.values_list('name', flat=True).distinct())

    data = {
        "devices": devices,
        "vendors": vendors,
        "types": types,
        "base_scores": base_scores,
        "base_severities": base_severities,
        "exploitability_scores": exploitability_scores,
        "impact_scores": impact_scores,
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
    vuln_filter, device_filter = data_by_filters(request)

    vulns = Vulnerability.objects.filter(vuln_filter)
    devices = Device.objects.filter(device_filter, Vulnerabilities__in=vulns).distinct()

    result = {
        vendor.name: devices.filter(vendor=vendor).count()
        for vendor in Vendor.objects.all()
    }

    return JsonResponse(result)
