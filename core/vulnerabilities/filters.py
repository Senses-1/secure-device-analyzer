from django.db.models import Q

def data_by_filters(request):
    # Фильтры для модели Vulnerability
    vuln_filter = Q()
    base_score_min = request.GET.get('base_score_min')
    base_score_max = request.GET.get('base_score_max')
    exploitability_min = request.GET.get('exploitability_score_min')
    exploitability_max = request.GET.get('exploitability_score_max')
    impact_min = request.GET.get('impact_score_min')
    impact_max = request.GET.get('impact_score_max')

    if base_score_min and base_score_max:
        vuln_filter &= Q(BaseScore__gte=base_score_min, BaseScore__lte=base_score_max)
    if exploitability_min and exploitability_max:
        vuln_filter &= Q(ExploitabilityScore__gte=exploitability_min, ExploitabilityScore__lte=exploitability_max)
    if impact_min and impact_max:
        vuln_filter &= Q(ImpactScore__gte=impact_min, ImpactScore__lte=impact_max)

    attack_vectors = request.GET.getlist('attack_vector[]')
    attack_complexitys = request.GET.getlist('attack_complexity[]')
    privileges_requireds = request.GET.getlist('privileges_required[]')
    user_interactions = request.GET.getlist('user_interaction[]')
    scopes = request.GET.getlist('scope[]')
    confidentialitys = request.GET.getlist('confidentiality[]')
    integritys = request.GET.getlist('integrity[]')
    availabilitys = request.GET.getlist('availability[]')

    if attack_vectors:
        vuln_filter &= Q(attack_vector__name__in=attack_vectors)
    if attack_complexitys:
        vuln_filter &= Q(attack_complexity__name__in=attack_complexitys)
    if privileges_requireds:
        vuln_filter &= Q(privileges_required__name__in=privileges_requireds)
    if user_interactions:
        vuln_filter &= Q(user_interaction__name__in=user_interactions)
    if scopes:
        vuln_filter &= Q(scope__name__in=scopes)
    if confidentialitys:
        vuln_filter &= Q(confidentiality__name__in=confidentialitys)
    if integritys:
        vuln_filter &= Q(integrity__name__in=integritys)
    if availabilitys:
        vuln_filter &= Q(availability__name__in=availabilitys)

    # Фильтры для модели Device
    device_filter = Q()
    types = request.GET.getlist('type[]')
    vendors = request.GET.getlist('vendor[]')

    if types:
        device_filter &= Q(type__name__in=types)
    if vendors:
        device_filter &= Q(vendor__name__in=vendors)

    return vuln_filter, device_filter
