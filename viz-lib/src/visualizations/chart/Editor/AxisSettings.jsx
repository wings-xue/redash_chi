import { isString, isObject, isFinite, isNumber, merge } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import { useDebouncedCallback } from "use-debounce";
import * as Grid from "antd/lib/grid";
import { Section, Select, Input, InputNumber } from "@/components/visualizations/editor";

function toNumber(value) {
  value = isNumber(value) ? value : parseFloat(value);
  return isFinite(value) ? value : null;
}

export default function AxisSettings({ id, options, features, onChange }) {
  function optionsChanged(newOptions) {
    onChange(merge({}, options, newOptions));
  }

  const [handleNameChange] = useDebouncedCallback(text => {
    const title = isString(text) && text !== "" ? { text } : null;
    optionsChanged({ title });
  }, 200);

  const [handleMinMaxChange] = useDebouncedCallback(opts => optionsChanged(opts), 200);

  return (
    <React.Fragment>
      <Section>
        <Select
          label="缩放"
          data-test={`Chart.${id}.Type`}
          defaultValue={options.type}
          onChange={type => optionsChanged({ type })}>
          {features.autoDetectType && (
            <Select.Option value="-" data-test={`Chart.${id}.Type.Auto`}>
              自动探测
            </Select.Option>
          )}
          <Select.Option value="datetime" data-test={`Chart.${id}.Type.DateTime`}>
            日期时间
          </Select.Option>
          <Select.Option value="linear" data-test={`Chart.${id}.Type.Linear`}>
            线性缩放
          </Select.Option>
          <Select.Option value="logarithmic" data-test={`Chart.${id}.Type.Logarithmic`}>
            对数缩放
          </Select.Option>
          <Select.Option value="category" data-test={`Chart.${id}.Type.Category`}>
            分类缩放
          </Select.Option>
        </Select>
      </Section>

      <Section>
        <Input
          label="名称"
          data-test={`Chart.${id}.Name`}
          defaultValue={isObject(options.title) ? options.title.text : null}
          onChange={event => handleNameChange(event.target.value)}
        />
      </Section>

      {features.range && (
        <Section>
          <Grid.Row gutter={15} type="flex" align="middle">
            <Grid.Col span={12}>
              <InputNumber
                label="最小值"
                placeholder="自动"
                data-test={`Chart.${id}.RangeMin`}
                defaultValue={toNumber(options.rangeMin)}
                onChange={value => handleMinMaxChange({ rangeMin: toNumber(value) })}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <InputNumber
                label="最大值"
                placeholder="自动"
                data-test={`Chart.${id}.RangeMax`}
                defaultValue={toNumber(options.rangeMax)}
                onChange={value => handleMinMaxChange({ rangeMax: toNumber(value) })}
              />
            </Grid.Col>
          </Grid.Row>
        </Section>
      )}
    </React.Fragment>
  );
}

AxisSettings.propTypes = {
  id: PropTypes.string.isRequired,
  options: PropTypes.shape({
    type: PropTypes.string.isRequired,
    title: PropTypes.shape({
      text: PropTypes.string,
    }),
    rangeMin: PropTypes.number,
    rangeMax: PropTypes.number,
  }).isRequired,
  features: PropTypes.shape({
    autoDetectType: PropTypes.bool,
    range: PropTypes.bool,
  }),
  onChange: PropTypes.func,
};

AxisSettings.defaultProps = {
  features: {},
  onChange: () => {},
};
