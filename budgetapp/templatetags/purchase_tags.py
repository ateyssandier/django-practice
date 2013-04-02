from django import template
from django.template import Context
from django.contrib.humanize.templatetags.humanize import intcomma

register = template.Library()

@register.filter
def currency(dollars):
    dollars = round(float(dollars), 2)
    #if dollars == 0:
    #    return_string =  "$%s%s" % (intcomma(int(dollars)), ("%0.2f" % dollars)[-3:])
    #    return_string = return_string.replace("-", "")
    #    return_string = "-" + return_string
    #    return return_string
    #else:
        #return "$%s%s" % (intcomma(int(dollars)), ("%0.2f" % dollars)[-3:])
    return "$%s%s" % (intcomma(int(dollars)), ("%0.2f" % dollars)[-3:])
