import { map, merge } from "lodash";
import React from "react";
import * as Grid from "antd/lib/grid";
import { Section, Select, InputNumber, ControlLabel } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";

export default function Editor({ options, data, onOptionsChange }) {
  const optionsChanged = newOptions => {
    onOptionsChange(merge({}, options, newOptions));
  };

  return (
    <React.Fragment>
      <Section>
        <Select
          label="关键词取值"
          data-test="WordCloud.WordsColumn"
          value={options.column}
          onChange={column => optionsChanged({ column })}>
          {map(data.columns, ({ name }) => (
            <Select.Option key={name} data-test={"WordCloud.WordsColumn." + name}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Section>
      <Section>
        <Select
          label="出现频率取值"
          data-test="WordCloud.FrequenciesColumn"
          value={options.frequenciesColumn}
          onChange={frequenciesColumn => optionsChanged({ frequenciesColumn })}>
          <Select.Option key="none" value="">
            <i>(自动统计关键次出现频率)</i>
          </Select.Option>
          {map(data.columns, ({ name }) => (
            <Select.Option key={"column-" + name} value={name} data-test={"WordCloud.FrequenciesColumn." + name}>
              {name}
            </Select.Option>
          ))}
        </Select>
      </Section>
      <Section>
        <ControlLabel label="关键词长度限制">
          <Grid.Row gutter={15} type="flex">
            <Grid.Col span={12}>
              <InputNumber
                data-test="WordCloud.WordLengthLimit.Min"
                placeholder="最小"
                min={0}
                value={options.wordLengthLimit.min}
                onChange={value => optionsChanged({ wordLengthLimit: { min: value > 0 ? value : null } })}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <InputNumber
                data-test="WordCloud.WordLengthLimit.Max"
                placeholder="最大"
                min={0}
                value={options.wordLengthLimit.max}
                onChange={value => optionsChanged({ wordLengthLimit: { max: value > 0 ? value : null } })}
              />
            </Grid.Col>
          </Grid.Row>
        </ControlLabel>
      </Section>
      <Section>
        <ControlLabel label="出现频率限制">
          <Grid.Row gutter={15} type="flex">
            <Grid.Col span={12}>
              <InputNumber
                data-test="WordCloud.WordCountLimit.Min"
                placeholder="最小"
                min={0}
                value={options.wordCountLimit.min}
                onChange={value => optionsChanged({ wordCountLimit: { min: value > 0 ? value : null } })}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <InputNumber
                data-test="WordCloud.WordCountLimit.Max"
                placeholder="最大"
                min={0}
                value={options.wordCountLimit.max}
                onChange={value => optionsChanged({ wordCountLimit: { max: value > 0 ? value : null } })}
              />
            </Grid.Col>
          </Grid.Row>
        </ControlLabel>
      </Section>
    </React.Fragment>
  );
}

Editor.propTypes = EditorPropTypes;
