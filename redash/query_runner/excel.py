import json
import logging
import yaml
import os

from redash import settings
from redash.query_runner import *
from redash.utils import JSONEncoder

logger = logging.getLogger(__name__)

try:
    import pandas as pd
    import xlrd
    import numpy as np
    enabled = True
except ImportError:
    enabled = False


class Excel(BaseQueryRunner):
    should_annotate_query = False

    @classmethod
    def type(cls):
        return "excel"

    @classmethod
    def enabled(cls):
        return enabled

    @classmethod
    def configuration_schema(cls):
        return {
            'type': 'object',
            'properties': {},
        }

    def __init__(self, configuration):
        super(Excel, self).__init__(configuration)
        self.syntax = "excel"

    def test_connection(self):
        pass

    def run_query(self, query, user):
        error = "请购买插件！"
        return None, error

register(Excel)