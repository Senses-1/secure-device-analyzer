from django.db import models

class AV(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name

class AC(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name

class PR(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name
    
class UI(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name

class S(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name

class C(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name

class I(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name

class A(models.Model):
    name = models.CharField(max_length=1, unique=True)

    def __str__(self):
        return self.name

class Vulnerability(models.Model):
    cve = models.CharField(max_length=255, unique=True)
    BaseScore = models.DecimalField(decimal_places=1, max_digits=3)
    BaseSeverity = models.CharField(max_length=8, unique=True)
    ExploitabilityScore	= models.DecimalField(decimal_places=1, max_digits=3)
    Exploitability = models.DecimalField(decimal_places=2, max_digits=3)
    ІmpactScore	= models.DecimalField(decimal_places=1, max_digits=3)
    AV = models.ForeignKey(AV, on_delete=models.CASCADE)
    AC = models.ForeignKey(AC, on_delete=models.CASCADE)
    PR = models.ForeignKey(PR, on_delete=models.CASCADE)
    UI = models.ForeignKey(UI, on_delete=models.CASCADE)
    S = models.ForeignKey(S, on_delete=models.CASCADE)
    C = models.ForeignKey(C, on_delete=models.CASCADE)
    I = models.ForeignKey(I, on_delete=models.CASCADE)
    A = models.ForeignKey(A, on_delete=models.CASCADE)

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