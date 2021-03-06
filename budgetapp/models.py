from django.db import models
from django.forms import ModelChoiceField

SUPERCATEGORY_CHOICES = (
    ('Bills and Utilities', 'Bills and Utilities'),
    ('Auto and Transport', 'Auto and Transport'),
    ('Clothing', 'Clothing'),
    ('Entertainment', 'Entertainment'),
    ('Food', 'Food'),
    ('Health', 'Health'),
    ('Personal Care', 'Personal Care'),
    ('Rent', 'Rent'),
    ('Shopping', 'Shopping'),
    ('Student Loans', 'Student Loans'),
    ('Taxes', 'Taxes'),
    ('Travel', 'Travel'),
    ('Unknown', 'Unknown'),
)
class SuperCategory(models.Model):
    name = models.CharField(max_length=200, choices=SUPERCATEGORY_CHOICES)
    def __unicode__(self):
       return self.name

class SubCategory(models.Model):
    superCategory = models.ForeignKey('SuperCategory')
    subCategory = models.CharField(max_length=200)
    mint_id = models.IntegerField(unique=False)

    def get_super_categories(self, superCategory):
        "Returns a list of all subcategories in a super category"
        return self.subCategory in (superCategory)

    def __unicode__(self):
        return self.subCategory

class Paychecks(models.Model):
    date = models.DateField()
    mint_id = models.IntegerField(unique=False)
    gross = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    tax = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, null=True)
    healthcare = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, null=True)
    fica = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, null=True)
    k401 = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, null=True)
    net = models.DecimalField(max_digits=6, decimal_places=2)
    excluded = models.BooleanField(default=False)

    def __unicode__(self):
        return self.net.__str__()

    def date_received(self):
        return self.date


class Purchases(models.Model):
    date = models.DateField()
    mint_id = models.IntegerField(unique=False)
    item_desc = models.TextField()
    cost = models.DecimalField(max_digits=6, decimal_places=2)
    category = models.ForeignKey('SubCategory')


    def to_dict(self):
        purchase_dict = {}
        purchase_dict['date'] = self.date
        purchase_dict['item_desc'] = self.item_desc
        purchase_dict['cost'] = self.cost
        purchase_dict['sub_category'] = self.category.__unicode__()
        purchase_dict['super_category'] = self.category.superCategory.__unicode__()
        return purchase_dict

class MyModelChoiceField(ModelChoiceField):
    def label_from_instance(self, obj):
        return "My Object #%i" % obj.superCategory 

