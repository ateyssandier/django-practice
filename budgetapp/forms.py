# -*- coding: utf-8 -*-
from django import forms
from models import Category, MyModelChoiceField
from django.forms import ModelChoiceField
from django.forms import widgets
import calendar
import datetime


MONTHS = [((calendar.month_name[month]), (calendar.month_name[month])) for month in range(1,13)]

YEARS = [(year, year) for year in range(2010, datetime.date.today().year+1)]

class AddCategoryForm(forms.Form):
    super_category  = forms.TextInput()
    sub_category = forms.CharField(widget=forms.TextInput(attrs={'maxlength':50}),)

    def get(self, request, *args, **kwargs):
        #todo throw exception here since you shouldn't get this
        pass

    def post(self, request, *args, **kwargs):
        print "something"



class AddPaycheckForm(forms.Form):
    month  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('mm'), 'maxlength':2, 'class':'month'}),)
    day  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('dd'), 'maxlength':2, 'class':'day'}),)
    year  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('yyyy'), 'maxlength':4, 'class':'year'}),)
    gross  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('gross'), 'maxlength':'8'}),)
    tax  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('tax'), 'maxlength':'8'}),)
    k401  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('k401'), 'maxlength':'8'}),)
    healthcare  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('healthcare'), 'maxlength':'8'}),)
    fica  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('fica'), 'maxlength':'8'}),)

class AddPurchaseForm(forms.Form):
    month  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('mm'), 'maxlength':2, 'class':'month'}),)
    day  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('dd'), 'maxlength':2, 'class':'day'}),)
    year  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('yyyy'), 'maxlength':4, 'class':'year'}),)
    description  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('Description'), 'maxlength':'8', 'class':'description'}),)
    category  = forms.ModelChoiceField(queryset=Category.objects.order_by('superCategory'), empty_label="Select SubCategory")
    cost  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': (''), 'maxlength':'8', 'class': 'cost'}),)


class NavigationForm(forms.Form):
    standard_month = forms.ChoiceField(widget=forms.RadioSelect, choices=MONTHS)
    standard_year = forms.ChoiceField(widget=forms.RadioSelect, choices=YEARS)
    custom_month  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('mm'), 'maxlength':2, 'class':'month'}),)
    custom_day  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('dd'), 'maxlength':2, 'class':'day'}),)
    custom_year  = forms.CharField(widget=forms.TextInput(attrs={'placeholder': ('yyyy'), 'maxlength':4, 'class':'year'}),)


