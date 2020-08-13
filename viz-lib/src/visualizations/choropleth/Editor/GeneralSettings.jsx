import { map } from "lodash";
import React, { useMemo } from "react";
import { EditorPropTypes } from "@/visualizations/prop-types";
import { Section, Select } from "@/components/visualizations/editor";
import { inferCountryCodeType } from "./utils";

export default function GeneralSettings({ options, data, onOptionsChange }) {
  const countryCodeTypes = useMemo(() => {
    switch (options.mapType) {
      case "countries":
        return {
          name: "国家简称(英文)",
          name_long: "国家全称(英文)",
          abbrev: "国家缩写(英文)",
          iso_a2: "ISO国家代码(2字母)",
          iso_a3: "ISO国家代码(3字母)",
          iso_n3: "ISO国家代码(3数字)",
        };
      case "subdiv_japan":
        return {
          name: "日本行政区划名称(英文)",
          name_local: "日本行政区划名称(日文)",
          iso_3166_2: "ISO-3166-2日本行政区划代码",
        };
      default:
        return {};
    }
  }, [options.mapType]);

  const handleChangeAndInferType = newOptions => {
    newOptions.countryCodeType =
      inferCountryCodeType(
        newOptions.mapType || options.mapType,
        data ? data.rows : [],
        newOptions.countryCodeColumn || options.countryCodeColumn
      ) || options.countryCodeType;
    onOptionsChange(newOptions);
  };

  return (
    <React.Fragment>
      <Section>
        <Select
          label="地图选择"
          data-test="Choropleth.Editor.MapType"
          defaultValue={options.mapType}
          onChange={mapType => handleChangeAndInferType({ mapType })}>
          <Select.Option key="countries" data-test="Choropleth.Editor.MapType.Countries">
            全球国家地图
          </Select.Option>
          <Select.Option key="subdiv_japan" data-test="Choropleth.Editor.MapType.Japan">
            日本行政区划图
          </Select.Option>
        </Select>
      </Section>

      <Section>
        <Select
          label="地理区域取值"
          data-test="Choropleth.Editor.KeyColumn"
          defaultValue={options.countryCodeColumn}
          onChange={countryCodeColumn => handleChangeAndInferType({ countryCodeColumn })}>
          {map(data.columns, ({ name }) => (
            <Select.Option key={name} data-test={`Choropleth.Editor.KeyColumn.${name}`}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Section>

      <Section>
        <Select
          label="地理区域值类型"
          data-test="Choropleth.Editor.KeyType"
          value={options.countryCodeType}
          onChange={countryCodeType => onOptionsChange({ countryCodeType })}>
          {map(countryCodeTypes, (name, type) => (
            <Select.Option key={type} data-test={`Choropleth.Editor.KeyType.${type}`}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Section>

      <Section>
        <Select
          label="数据取值"
          data-test="Choropleth.Editor.ValueColumn"
          defaultValue={options.valueColumn}
          onChange={valueColumn => onOptionsChange({ valueColumn })}>
          {map(data.columns, ({ name }) => (
            <Select.Option key={name} data-test={`Choropleth.Editor.ValueColumn.${name}`}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Section>
    </React.Fragment>
  );
}

GeneralSettings.propTypes = EditorPropTypes;
