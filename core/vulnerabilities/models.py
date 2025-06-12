from django.db import models

class attack_vector(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name

class attack_complexity(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name

class privileges_required(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name
    
class user_interaction(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name

class scope(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name

class confidentiality(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name

class integrity(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name

class availability(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name

class Vulnerability(models.Model):
    cve = models.CharField(max_length=255, unique=True)
    BaseScore = models.DecimalField(decimal_places=1, max_digits=3)
    ExploitabilityScore	= models.DecimalField(decimal_places=1, max_digits=3)
    ImpactScore	= models.DecimalField(decimal_places=1, max_digits=3)
    attack_vector = models.ForeignKey(attack_vector, on_delete=models.CASCADE)
    attack_complexity = models.ForeignKey(attack_complexity, on_delete=models.CASCADE)
    privileges_required = models.ForeignKey(privileges_required, on_delete=models.CASCADE)
    user_interaction = models.ForeignKey(user_interaction, on_delete=models.CASCADE)
    scope = models.ForeignKey(scope, on_delete=models.CASCADE)
    confidentiality = models.ForeignKey(confidentiality, on_delete=models.CASCADE)
    integrity = models.ForeignKey(integrity, on_delete=models.CASCADE)
    availability = models.ForeignKey(availability, on_delete=models.CASCADE)

    def __str__(self):
        return self.cve
    
class Vendor(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Type(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Device(models.Model):
    name = models.CharField(max_length=255, unique=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    type = models.ForeignKey(Type, on_delete=models.CASCADE)
    Vulnerabilities = models.ManyToManyField(Vulnerability, blank=True)

    def __str__(self):
        return self.name