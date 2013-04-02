from django.db import models
from django.forms import ModelChoiceField
class Category(models.Model):
    superCategory = models.CharField(max_length=200)
    subCategory = models.CharField(max_length=200)


    def get_super_categories(self, superCategory):
        "Returns a list of all subcategories in a super category"
        return self.subCategory in (superCategory)

    def __unicode__(self):
        return self.subCategory

class Paychecks(models.Model):
    date = models.DateField()
    gross = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    tax = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, null=True)
    healthcare = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, null=True)
    fica = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, null=True)
    k401 = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, null=True)
    net = models.DecimalField(max_digits=6, decimal_places=2)

    def __unicode__(self):
        return self.net

    def date_received(self):
        return self.date


class Purchases(models.Model):
    date = models.DateField()
    item_desc = models.TextField()
    cost = models.DecimalField(max_digits=6, decimal_places=2)
    category = models.ForeignKey('Category')


    def to_dict(self):
        purchase_dict = {}
        purchase_dict['date'] = self.date
        purchase_dict['item_desc'] = self.item_desc
        purchase_dict['cost'] = self.cost
        purchase_dict['sub_category'] = self.category.__unicode__()
        purchase_dict['super_category'] = self.category.superCategory
        return purchase_dict


class MyModelChoiceField(ModelChoiceField):
    def label_from_instance(self, obj):
        return "My Object #%i" % obj.superCategory