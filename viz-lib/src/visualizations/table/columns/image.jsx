import { extend, trim } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import { useDebouncedCallback } from "use-debounce";
import { Section, Input, ControlLabel, ContextHelp } from "@/components/visualizations/editor";
import { formatSimpleTemplate } from "@/lib/value-format";

function Editor({ column, onChange }) {
  const [onChangeDebounced] = useDebouncedCallback(onChange, 200);

  return (
    <React.Fragment>
      <Section>
        <Input
          label="URL模板"
          data-test="Table.ColumnEditor.Image.UrlTemplate"
          defaultValue={column.imageUrlTemplate}
          onChange={event => onChangeDebounced({ imageUrlTemplate: event.target.value })}
        />
      </Section>

      <Section>
        <ControlLabel
          label={
            <React.Fragment>
              尺寸
              <ContextHelp placement="topLeft" arrowPointAtCenter>
                <div style={{ marginBottom: 5 }}>输入正整数像素值。</div>
                <div>为空将使用默认值。</div>
              </ContextHelp>
            </React.Fragment>
          }>
          <div className="image-dimension-selector">
            <Input
              data-test="Table.ColumnEditor.Image.Width"
              placeholder="宽度"
              defaultValue={column.imageWidth}
              onChange={event => onChangeDebounced({ imageWidth: event.target.value })}
            />
            <span className="image-dimension-selector-spacer">&times;</span>
            <Input
              data-test="Table.ColumnEditor.Image.Height"
              placeholder="高度"
              defaultValue={column.imageHeight}
              onChange={event => onChangeDebounced({ imageHeight: event.target.value })}
            />
          </div>
        </ControlLabel>
      </Section>

      <Section>
        <Input
          label="标题模板"
          data-test="Table.ColumnEditor.Image.TitleTemplate"
          defaultValue={column.imageTitleTemplate}
          onChange={event => onChangeDebounced({ imageTitleTemplate: event.target.value })}
        />
      </Section>

      <Section>
        <ContextHelp
          placement="topLeft"
          arrowPointAtCenter
          icon={<span style={{ cursor: "default" }}>Format specs {ContextHelp.defaultIcon}</span>}>
          <div>
            所有列都可以关联使用，请按 <code>{"{{ column_name }}"}</code> 表达形式。
          </div>
          <div>
            使用 <code>{"{{ @ }}"}</code> 关联当前列。
          </div>
          <div>该表达形式也适用于URL、标题和尺寸设置。</div>
        </ContextHelp>
      </Section>
    </React.Fragment>
  );
}

Editor.propTypes = {
  column: PropTypes.shape({
    name: PropTypes.string.isRequired,
    imageUrlTemplate: PropTypes.string,
    imageWidth: PropTypes.string,
    imageHeight: PropTypes.string,
    imageTitleTemplate: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function initImageColumn(column) {
  function prepareData(row) {
    row = extend({ "@": row[column.name] }, row);

    const src = trim(formatSimpleTemplate(column.imageUrlTemplate, row));
    if (src === "") {
      return {};
    }

    const width = parseInt(formatSimpleTemplate(column.imageWidth, row), 10);
    const height = parseInt(formatSimpleTemplate(column.imageHeight, row), 10);
    const title = trim(formatSimpleTemplate(column.imageTitleTemplate, row));

    const result = { src };

    if (Number.isFinite(width) && width > 0) {
      result.width = width;
    }
    if (Number.isFinite(height) && height > 0) {
      result.height = height;
    }
    if (title !== "") {
      result.text = title; // `text` is used for search
      result.title = title;
      result.alt = title;
    }

    return result;
  }

  function ImageColumn({ row }) {
    // eslint-disable-line react/prop-types
    const { text, ...props } = prepareData(row);
    return <img alt="" {...props} />;
  }

  ImageColumn.prepareData = prepareData;

  return ImageColumn;
}

initImageColumn.friendlyName = "图像";
initImageColumn.Editor = Editor;
