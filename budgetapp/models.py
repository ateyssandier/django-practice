from django.db import models
from django.forms import ModelChoiceField

SUPERCATEGORY_CHOICES = (
    ('Bills and Utilities', 'Bills and Utilities'),
    ('Car', 'Car'),
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

class Category(models.Model):
    superCategory = models.CharField(max_length=200, choices=SUPERCATEGORY_CHOICES)
    subCategory = models.CharField(max_length=200)
    #for now subcategories of budgets will be mutually exclusive (one to many). i.e. a subcategory can not be in more than one budget
    #this is to be able to determine which transactions fall into an "everything else" budget category.
    #budget = models.ForeignKey('Budget',blank=True, null=True, on_delete=models.SET_NULL)


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

class Budget(models.Model):
    max = models.DecimalField(max_digits=6, decimal_places=2, default=0.00, null=True)
    #for now subcategories of budgets will be mutually exclusive (one to many). i.e. a subcategory can not be in more than one budget
    #this is to be able to determine which transactions fall into an "everything else" budget category.
    categories = models.ManyToManyField(Category)
