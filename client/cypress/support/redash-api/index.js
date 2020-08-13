/* global cy, Cypress */

const { extend, get, merge, find } = Cypress._;

const post = options =>
  cy
    .getCookie("csrf_token")
    .then(csrf => cy.request({ ...options, method: "POST", headers: { "X-CSRF-TOKEN": csrf.value } }));

export function createDashboard(name) {
  return post({ url: "api/dashboards", body: { name } }).then(({ body }) => body);
}

export function createQuery(data, shouldPublish = true) {
  const merged = extend(
    {
      name: "Test Query",
      query: "select 1",
      data_source_id: 1,
      options: {
        parameters: [],
      },
      schedule: null,
    },
    data
  );

  // eslint-disable-next-line cypress/no-assigning-return-values
  let request = post({ url: "/api/queries", body: merged }).then(({ body }) => body);
  if (shouldPublish) {
    request = request.then(query =>
      post({ url: `/api/queries/${query.id}`, body: { is_draft: false } }).then(() => query)
    );
  }

  return request;
}

export function createVisualization(queryId, type, name, options) {
  const data = { query_id: queryId, type, name, options };
  return post({ url: "/api/visualizations", body: data }).then(({ body }) => ({
    query_id: queryId,
    ...body,
  }));
}

export function addTextbox(dashboardId, text = "text", options = {}) {
  const defaultOptions = {
    position: { col: 0, row: 0, sizeX: 3, sizeY: 3 },
  };

  const data = {
    width: 1,
    dashboard_id: dashboardId,
    visualization_id: null,
    text,
    options: merge(defaultOptions, options),
  };

  return post({ url: "api/widgets", body: data }).then(({ body }) => {
    const id = get(body, "id");
    assert.isDefined(id, "Widget api call returns widget id");
    return body;
  });
}

export function addWidget(dashboardId, visualizationId, options = {}) {
  const defaultOptions = {
    position: { col: 0, row: 0, sizeX: 3, sizeY: 3 },
  };

  const data = {
    width: 1,
    dashboard_id: dashboardId,
    visualization_id: visualizationId,
    options: merge(defaultOptions, options),
  };

  return post({ url: "api/widgets", body: data }).then(({ body }) => {
    const id = get(body, "id");
    assert.isDefined(id, "Widget api call returns widget id");
    return body;
  });
}

export function createAlert(queryId, options = {}, name) {
  const defaultOptions = {
    column: "?column?",
    op: "greater than",
    rearm: 0,
    value: 1,
  };

  const data = {
    query_id: queryId,
    name: name || "Alert for query " + queryId,
    options: merge(defaultOptions, options),
  };

  return post({ url: "api/alerts", body: data }).then(({ body }) => {
    const id = get(body, "id");
    assert.isDefined(id, "Alert api call retu ns alert id");
    return body;
  });
}

export function createUser({ name, email, password }) {
  return post({
    url: "api/users?no_invite=yes",
    body: { name, email },
    failOnStatusCode: false,
  }).then(xhr => {
    const { status, body } = xhr;
    if (status < 200 || status > 400) {
      throw new Error(xhr);
    }

    if (status === 400 && body.message === "Email already taken.") {
      // all is good, do nothing
      return;
    }

    const id = get(body, "id");
    assert.isDefined(id, "User api call returns user id");

    return post({
      url: body.invite_link,
      form: true,
      body: { password },
    });
  });
}

export function createDestination(name, type, options = {}) {
  return post({
    url: "api/destinations",
    body: { name, type, options },
    failOnStatusCode: false,
  });
}

export function getDestinations() {
  return cy.request("GET", "api/destinations").then(({ body }) => body);
}

export function addDestinationSubscription(alertId, destinationName) {
  return getDestinations()
    .then(destinations => {
      const destination = find(destinations, { name: destinationName });
      if (!destination) {
        throw new Error("Destination not found");
      }
      return post({
        url: `api/alerts/${alertId}/subscriptions`,
        body: {
          alert_id: alertId,
          destination_id: destination.id,
        },
      });
    })
    .then(({ body }) => {
      const id = get(body, "id");
      assert.isDefined(id, "Subscription api call returns subscription id");
      return body;
    });
}
