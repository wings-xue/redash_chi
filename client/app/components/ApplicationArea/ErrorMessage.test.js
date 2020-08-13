import React from "react";
import { mount } from "enzyme";
import ErrorMessage from "./ErrorMessage";

const ErrorMessages = {
  UNAUTHORIZED: "没有权限",
  NOT_FOUND: "网页不存在",
  GENERIC: "系统出错，请联系管理员。",
};

function mockAxiosError(status = 500, response = {}) {
  const error = new Error(`Failed with code ${status}.`);
  error.isAxiosError = true;
  error.response = { status, ...response };
  return error;
}

describe("Error Message", () => {
  const spyError = jest.spyOn(console, "error");

  beforeEach(() => {
    spyError.mockReset();
  });

  function expectErrorMessageToBe(error, errorMessage) {
    const component = mount(<ErrorMessage error={error} />);

    expect(component.find(".error-state__details h4").text()).toBe(errorMessage);
    expect(spyError).toHaveBeenCalledWith(error);
  }

  test("displays a generic message on adhoc errors", () => {
    expectErrorMessageToBe(new Error("technical information"), ErrorMessages.GENERIC);
  });

  test("displays a not found message on axios errors with 404 code", () => {
    expectErrorMessageToBe(mockAxiosError(404), ErrorMessages.NOT_FOUND);
  });

  test("displays a unauthorized message on axios errors with 401 code", () => {
    expectErrorMessageToBe(mockAxiosError(401), ErrorMessages.UNAUTHORIZED);
  });

  test("displays a unauthorized message on axios errors with 403 code", () => {
    expectErrorMessageToBe(mockAxiosError(403), ErrorMessages.UNAUTHORIZED);
  });

  test("displays a generic message on axios errors with 500 code", () => {
    expectErrorMessageToBe(mockAxiosError(500), ErrorMessages.GENERIC);
  });
});
