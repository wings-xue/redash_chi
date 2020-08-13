import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toLower, isNumber } from "lodash";

import InputNumber from "antd/lib/input-number";
import Select from "antd/lib/select";

import "./Rearm.less";

const DURATIONS = [
  ["秒", 1],
  ["分钟", 60],
  ["小时", 3600],
  ["天", 86400],
  ["周", 604800],
];

function RearmByDuration({ value, onChange, editMode }) {
  const [durationIdx, setDurationIdx] = useState();
  const [count, setCount] = useState();

  useEffect(() => {
    for (let i = DURATIONS.length - 1; i >= 0; i -= 1) {
      const [, durValue] = DURATIONS[i];
      if (value % durValue === 0) {
        setDurationIdx(i);
        setCount(value / durValue);
        break;
      }
    }
  }, [value]);

  if (!isNumber(count) || !isNumber(durationIdx)) {
    return null;
  }

  const onChangeCount = newCount => {
    setCount(newCount);
    onChange(newCount * DURATIONS[durationIdx][1]);
  };

  const onChangeIdx = newIdx => {
    setDurationIdx(newIdx);
    onChange(count * DURATIONS[newIdx][1]);
  };

  const plural = count !== 1 ? "s" : "";

  if (editMode) {
    return (
      <>
        <InputNumber value={count} onChange={onChangeCount} min={1} precision={0} />
        <Select value={durationIdx} onChange={onChangeIdx}>
          {DURATIONS.map(([name], idx) => (
            <Select.Option value={idx} key={name}>
              {name}
              {plural}
            </Select.Option>
          ))}
        </Select>
      </>
    );
  }

  const [name] = DURATIONS[durationIdx];
  return count + " " + toLower(name) + plural;
}

RearmByDuration.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.number.isRequired,
  editMode: PropTypes.bool.isRequired,
};

RearmByDuration.defaultProps = {
  onChange: () => {},
};

function RearmEditor({ value, onChange }) {
  const [selected, setSelected] = useState(value < 2 ? value : 2);

  const _onChange = newSelected => {
    setSelected(newSelected);
    onChange(newSelected < 2 ? newSelected : 3600);
  };

  return (
    <div className="alert-rearm">
      <Select
        optionLabelProp="label"
        defaultValue={selected || 0}
        dropdownMatchSelectWidth={false}
        onChange={_onChange}>
        <Select.Option value={0} label="仅提醒一次">
          仅一次 <em>直至正常返回</em>
        </Select.Option>
        <Select.Option value={1} label="每次执行都提醒">
          每次执行都提醒 <em>直至正常返回</em>
        </Select.Option>
        <Select.Option value={2} label="最多提醒一次：每">
          最多提醒一次：每<em>当提醒触发后</em>
        </Select.Option>
      </Select>
      {selected === 2 && value && <RearmByDuration value={value} onChange={onChange} editMode />}
    </div>
  );
}

RearmEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number.isRequired,
};

function RearmViewer({ value }) {
  let phrase = "";
  switch (value) {
    case 0:
      phrase = "仅提醒一次，直至返回正常";
      break;
    case 1:
      phrase = "每次执行都提醒，直至返回正常";
      break;
    default:
      phrase = (
        <>
          最多一次：每 <RearmByDuration value={value} editMode={false} />, 当提醒触发。
        </>
      );
  }

  return <span>通知将会发送 {phrase}.</span>;
}

RearmViewer.propTypes = {
  value: PropTypes.number.isRequired,
};

export default function Rearm({ editMode, ...props }) {
  return editMode ? <RearmEditor {...props} /> : <RearmViewer {...props} />;
}

Rearm.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.number.isRequired,
  editMode: PropTypes.bool,
};

Rearm.defaultProps = {
  onChange: null,
  editMode: false,
};
