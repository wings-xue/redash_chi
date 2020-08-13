import { extend, trim } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import { useDebouncedCallback } from "use-debounce";
import { Section, Input, Checkbox, ContextHelp } from "@/components/visualizations/editor";
import { formatSimpleTemplate } from "@/lib/value-format";

function Editor({ column, onChange }) {
  const [onChangeDebounced] = useDebouncedCallback(onChange, 200);

  return (
    <React.Fragment>
      <Section>
        <Input
          label="URL模板"
          data-test="Table.ColumnEditor.Link.UrlTemplate"
          defaultValue={column.linkUrlTemplate}
          onChange={event => onChangeDebounced({ linkUrlTemplate: event.target.value })}
        />
      </Section>

      <Section>
        <Input
          label="文本模板"
          data-test="Table.ColumnEditor.Link.TextTemplate"
          defaultValue={column.linkTextTemplate}
          onChange={event => onChangeDebounced({ linkTextTemplate: event.target.value })}
        />
      </Section>

      <Section>
        <Input
          label="标题模板"
          data-test="Table.ColumnEditor.Link.TitleTemplate"
          defaultValue={column.linkTitleTemplate}
          onChange={event => onChangeDebounced({ linkTitleTemplate: event.target.value })}
        />
      </Section>

      <Section>
        <Checkbox
          data-test="Table.ColumnEditor.Link.OpenInNewTab"
          checked={column.linkOpenInNewTab}
          onChange={event => onChange({ linkOpenInNewTab: event.target.checked })}>
          在新标签页打开
        </Checkbox>
      </Section>

      <Section>
        <ContextHelp
          placement="topLeft"
          arrowPointAtCenter
          icon={<span style={{ cursor: "default" }}>Format specs {ContextHelp.defaultIcon}</span>}>
          <div>
          所有列都可以关联使用，请按 <code>{"{{ column_name }}"}</code> 表达形式。.
          </div>
          <div>
          使用 <code>{"{{ @ }}"}</code> 关联当前列。
          </div>
          <div>该表达形式也适用于URL、文本和标题设置。</div>
        </ContextHelp>
      </Section>
    </React.Fragment>
  );
}

Editor.propTypes = {
  column: PropTypes.shape({
    name: PropTypes.string.isRequired,
    linkUrlTemplate: PropTypes.string,
    linkTextTemplate: PropTypes.string,
    linkTitleTemplate: PropTypes.string,
    linkOpenInNewTab: PropTypes.bool,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function initLinkColumn(column) {
  function prepareData(row) {
    row = extend({ "@": row[column.name] }, row);

    const href = trim(formatSimpleTemplate(column.linkUrlTemplate, row));
    if (href === "") {
      return {};
    }

    const title = trim(formatSimpleTemplate(column.linkTitleTemplate, row));
    const text = trim(formatSimpleTemplate(column.linkTextTemplate, row));

    const result = {
      href,
      text: text !== "" ? text : href,
    };

    if (title !== "") {
      result.title = title;
    }
    if (column.linkOpenInNewTab) {
      result.target = "_blank";
    }

    return result;
  }

  function LinkColumn({ row }) {
    // eslint-disable-line react/prop-types
    const { text, ...props } = prepareData(row);
    return <a {...props}>{text}</a>;
  }

  LinkColumn.prepareData = prepareData;

  return LinkColumn;
}

initLinkColumn.friendlyName = "链接";
initLinkColumn.Editor = Editor;
