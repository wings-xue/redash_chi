import React from "react";
import { Section, Input, InputNumber, Switch } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";

import { isValueNumber } from "../utils";

export default function FormatSettings({ options, data, onOptionsChange }) {
  const inputsEnabled = isValueNumber(data.rows, options);
  return (
    <React.Fragment>
      <Section>
        <InputNumber
          layout="horizontal"
          label="小数点位置"
          data-test="Counter.Formatting.DecimalPlace"
          defaultValue={options.stringDecimal}
          disabled={!inputsEnabled}
          onChange={stringDecimal => onOptionsChange({ stringDecimal })}
        />
      </Section>

      <Section>
        <Input
          layout="horizontal"
          label="小数点符号"
          data-test="Counter.Formatting.DecimalCharacter"
          defaultValue={options.stringDecChar}
          disabled={!inputsEnabled}
          onChange={e => onOptionsChange({ stringDecChar: e.target.value })}
        />
      </Section>

      <Section>
        <Input
          layout="horizontal"
          label="千分位分隔符"
          data-test="Counter.Formatting.ThousandsSeparator"
          defaultValue={options.stringThouSep}
          disabled={!inputsEnabled}
          onChange={e => onOptionsChange({ stringThouSep: e.target.value })}
        />
      </Section>

      <Section>
        <Input
          layout="horizontal"
          label="前缀"
          data-test="Counter.Formatting.StringPrefix"
          defaultValue={options.stringPrefix}
          disabled={!inputsEnabled}
          onChange={e => onOptionsChange({ stringPrefix: e.target.value })}
        />
      </Section>

      <Section>
        <Input
          layout="horizontal"
          label="后缀"
          data-test="Counter.Formatting.StringSuffix"
          defaultValue={options.stringSuffix}
          disabled={!inputsEnabled}
          onChange={e => onOptionsChange({ stringSuffix: e.target.value })}
        />
      </Section>

      <Section>
        <Switch
          data-test="Counter.Formatting.FormatTargetValue"
          defaultChecked={options.formatTargetValue}
          onChange={formatTargetValue => onOptionsChange({ formatTargetValue })}>
          格式化目标值
        </Switch>
      </Section>
    </React.Fragment>
  );
}

FormatSettings.propTypes = EditorPropTypes;
