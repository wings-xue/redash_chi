import React from "react";
import PropTypes from "prop-types";
import Tooltip from "antd/lib/tooltip";
import { localizeTime, durationHumanize } from "@/lib/utils";
import { RefreshScheduleType, RefreshScheduleDefault } from "../proptypes";

import "./ScheduleDialog.css";

export default class SchedulePhrase extends React.Component {
  static propTypes = {
    schedule: RefreshScheduleType,
    isNew: PropTypes.bool.isRequired,
    isLink: PropTypes.bool,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    schedule: RefreshScheduleDefault,
    isLink: false,
    onClick: () => {},
  };

  get content() {
    const { interval: seconds } = this.props.schedule || SchedulePhrase.defaultProps.schedule;
    if (!seconds) {
      return ["不自动刷新"];
    }
    const humanized = durationHumanize(seconds, {
      omitSingleValueNumber: true,
    });
    const short = `每 ${humanized}`;
    let full = `每 ${humanized} 自动刷新`;

    const { time, day_of_week: dayOfWeek } = this.props.schedule;
    if (time) {
      full += ` 在 ${localizeTime(time)}`;
    }
    if (dayOfWeek) {
      full += ` 在 ${dayOfWeek}`;
    }

    return [short, full];
  }

  render() {
    if (this.props.isNew) {
      return "不自动刷新";
    }

    const [short, full] = this.content;
    const content = full ? <Tooltip title={full}>{short}</Tooltip> : short;

    return this.props.isLink ? (
      <a className="schedule-phrase" onClick={this.props.onClick}>
        {content}
      </a>
    ) : (
      content
    );
  }
}
