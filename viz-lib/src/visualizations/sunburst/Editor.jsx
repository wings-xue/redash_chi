import React from "react";
import { Section } from "@/components/visualizations/editor";

export default function Editor() {
  return (
    <React.Fragment>
      <p>该视图要求查询结果具备下列格式之一：</p>
      <Section>
        <p>
          <strong>格式1：</strong>
        </p>
        <ul>
          <li>
            <strong>sequence</strong> - 序列id
          </li>
          <li>
            <strong>stage</strong> - 系列层级(如：1, 2, ...)
          </li>
          <li>
            <strong>node</strong> - 层级名称
          </li>
          <li>
            <strong>value</strong> - 数值
          </li>
        </ul>
      </Section>
      <Section>
        <p>
          <strong>格式2：</strong>
        </p>
        <ul>
          <li>
            <strong>stage1</strong> - 层级1的值
          </li>
          <li>
            <strong>stage2</strong> - 层级2的值(可空)
          </li>
          <li>
            <strong>stage3</strong> - 层级3的值(可空)
          </li>
          <li>
            <strong>stage4</strong> - 层级5的值(可空)
          </li>
          <li>
            <strong>stage5</strong> - 层级5的值(可空)
          </li>
          <li>
            <strong>value</strong> - 数值
          </li>
        </ul>
      </Section>
    </React.Fragment>
  );
}
