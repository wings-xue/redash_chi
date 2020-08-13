import { head, includes, trim, template, values } from "lodash";
import React from "react";
import PropTypes from "prop-types";

import LoadingState from "@/components/items-list/components/LoadingState";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import navigateTo from "@/components/ApplicationArea/navigateTo";

import { currentUser } from "@/services/auth";
import notification from "@/services/notification";
import AlertService from "@/services/alert";
import { Query as QueryService } from "@/services/query";
import routes from "@/services/routes";

import MenuButton from "./components/MenuButton";
import AlertView from "./AlertView";
import AlertEdit from "./AlertEdit";
import AlertNew from "./AlertNew";

const MODES = {
  NEW: 0,
  VIEW: 1,
  EDIT: 2,
};

const defaultNameBuilder = template("<%= query.name %>: <%= options.column %> <%= options.op %> <%= options.value %>");

export function getDefaultName(alert) {
  if (!alert.query) {
    return "新提醒";
  }
  return defaultNameBuilder(alert);
}

class Alert extends React.Component {
  static propTypes = {
    mode: PropTypes.oneOf(values(MODES)),
    alertId: PropTypes.string,
    onError: PropTypes.func,
  };

  static defaultProps = {
    mode: null,
    alertId: null,
    onError: () => {},
  };

  _isMounted = false;

  state = {
    alert: null,
    queryResult: null,
    pendingRearm: null,
    canEdit: false,
    mode: null,
  };

  componentDidMount() {
    this._isMounted = true;
    const { mode } = this.props;
    this.setState({ mode });

    if (mode === MODES.NEW) {
      this.setState({
        alert: {
          options: {
            op: ">",
            value: 1,
            muted: false,
          },
        },
        pendingRearm: 0,
        canEdit: true,
      });
    } else {
      const { alertId } = this.props;
      AlertService.get({ id: alertId })
        .then(alert => {
          if (this._isMounted) {
            const canEdit = currentUser.canEdit(alert);

            // force view mode if can't edit
            if (!canEdit) {
              this.setState({ mode: MODES.VIEW });
              notification.warn(
                "不能编辑提醒",
                "没有权限编辑提醒，当前处于只读模式。",
                { duration: 0 }
              );
            }

            this.setState({ alert, canEdit, pendingRearm: alert.rearm });
            this.onQuerySelected(alert.query);
          }
        })
        .catch(error => {
          if (this._isMounted) {
            this.props.onError(error);
          }
        });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  save = () => {
    const { alert, pendingRearm } = this.state;

    alert.name = trim(alert.name) || getDefaultName(alert);
    alert.rearm = pendingRearm || null;

    return AlertService.save(alert)
      .then(alert => {
        notification.success("保存成功！");
        navigateTo(`alerts/${alert.id}`, true);
        this.setState({ alert, mode: MODES.VIEW });
      })
      .catch(() => {
        notification.error("保存失败。");
      });
  };

  onQuerySelected = query => {
    this.setState(({ alert }) => ({
      alert: Object.assign(alert, { query }),
      queryResult: null,
    }));

    if (query) {
      // get cached result for column names and values
      new QueryService(query).getQueryResultPromise().then(queryResult => {
        if (this._isMounted) {
          this.setState({ queryResult });
          let { column } = this.state.alert.options;
          const columns = queryResult.getColumnNames();

          // default to first column name if none chosen, or irrelevant in current query
          if (!column || !includes(columns, column)) {
            column = head(queryResult.getColumnNames());
          }
          this.setAlertOptions({ column });
        }
      });
    }
  };

  onNameChange = name => {
    const { alert } = this.state;
    this.setState({
      alert: Object.assign(alert, { name }),
    });
  };

  onRearmChange = pendingRearm => {
    this.setState({ pendingRearm });
  };

  setAlertOptions = obj => {
    const { alert } = this.state;
    const options = { ...alert.options, ...obj };
    this.setState({
      alert: Object.assign(alert, { options }),
    });
  };

  delete = () => {
    const { alert } = this.state;
    return AlertService.delete(alert)
      .then(() => {
        notification.success("提醒删除成功！");
        navigateTo("alerts");
      })
      .catch(() => {
        notification.error("提醒删除失败。");
      });
  };

  mute = () => {
    const { alert } = this.state;
    return AlertService.mute(alert)
      .then(() => {
        this.setAlertOptions({ muted: true });
        notification.warn("通知设为静音！");
      })
      .catch(() => {
        notification.error("通知静音设置失败。");
      });
  };

  unmute = () => {
    const { alert } = this.state;
    return AlertService.unmute(alert)
      .then(() => {
        this.setAlertOptions({ muted: false });
        notification.success("通知恢复有声！");
      })
      .catch(() => {
        notification.error("通知恢复失败。");
      });
  };

  edit = () => {
    const { id } = this.state.alert;
    navigateTo(`alerts/${id}/edit`, true);
    this.setState({ mode: MODES.EDIT });
  };

  cancel = () => {
    const { id } = this.state.alert;
    navigateTo(`alerts/${id}`, true);
    this.setState({ mode: MODES.VIEW });
  };

  render() {
    const { alert } = this.state;
    if (!alert) {
      return <LoadingState className="m-t-30" />;
    }

    const muted = !!alert.options.muted;
    const { queryResult, mode, canEdit, pendingRearm } = this.state;

    const menuButton = (
      <MenuButton doDelete={this.delete} muted={muted} mute={this.mute} unmute={this.unmute} canEdit={canEdit} />
    );

    const commonProps = {
      alert,
      queryResult,
      pendingRearm,
      save: this.save,
      menuButton,
      onQuerySelected: this.onQuerySelected,
      onRearmChange: this.onRearmChange,
      onNameChange: this.onNameChange,
      onCriteriaChange: this.setAlertOptions,
      onNotificationTemplateChange: this.setAlertOptions,
    };

    return (
      <div className="alert-page">
        <div className="container">
          {mode === MODES.NEW && <AlertNew {...commonProps} />}
          {mode === MODES.VIEW && (
            <AlertView canEdit={canEdit} onEdit={this.edit} muted={muted} unmute={this.unmute} {...commonProps} />
          )}
          {mode === MODES.EDIT && <AlertEdit cancel={this.cancel} {...commonProps} />}
        </div>
      </div>
    );
  }
}

routes.register(
  "Alerts.New",
  routeWithUserSession({
    path: "/alerts/new",
    title: "新建提醒",
    render: pageProps => <Alert {...pageProps} mode={MODES.NEW} />,
  })
);
routes.register(
  "Alerts.View",
  routeWithUserSession({
    path: "/alerts/:alertId",
    title: "提醒",
    render: pageProps => <Alert {...pageProps} mode={MODES.VIEW} />,
  })
);
routes.register(
  "Alerts.Edit",
  routeWithUserSession({
    path: "/alerts/:alertId/edit",
    title: "提醒",
    render: pageProps => <Alert {...pageProps} mode={MODES.EDIT} />,
  })
);
