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
    import numpy as np
    enabled = True
except ImportError:
    enabled = False


class CSV(BaseQueryRunner):
    should_annotate_query = False

    @classmethod
    def type(cls):
        return "csv"

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
        super(CSV, self).__init__(configuration)
        self.syntax = "csv"

    def test_connection(self):
        pass

    def run_query(self, query, user):
        error = "请购买插件！"
        return None, error

register(CSV)