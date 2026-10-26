// src/errors.ts
var StickyErrorType = /* @__PURE__ */ ((StickyErrorType2) => {
  StickyErrorType2[StickyErrorType2["FILE_NOT_FOUND"] = 0] = "FILE_NOT_FOUND";
  StickyErrorType2[StickyErrorType2["FILE_CORRUPTED"] = 1] = "FILE_CORRUPTED";
  StickyErrorType2[StickyErrorType2["NO_PERMISSION"] = 2] = "NO_PERMISSION";
  StickyErrorType2[StickyErrorType2["UNKNOWN"] = 3] = "UNKNOWN";
  return StickyErrorType2;
})(StickyErrorType || {});
var StickyError = class {
  constructor(type, message) {
    this.message = message;
    this.type = type;
  }
};
export {
  StickyError,
  StickyErrorType
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2Vycm9ycy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGVudW0gU3RpY2t5RXJyb3JUeXBlIHtcbiAgRklMRV9OT1RfRk9VTkQsXG4gIEZJTEVfQ09SUlVQVEVELFxuICBOT19QRVJNSVNTSU9OLFxuICBVTktOT1dOLFxufVxuXG5leHBvcnQgY2xhc3MgU3RpY2t5RXJyb3Ige1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIHR5cGU6IFN0aWNreUVycm9yVHlwZTtcblxuICBjb25zdHJ1Y3Rvcih0eXBlOiBTdGlja3lFcnJvclR5cGUsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFPLElBQUssa0JBQUwsa0JBQUtBLHFCQUFMO0FBQ0wsRUFBQUEsa0NBQUE7QUFDQSxFQUFBQSxrQ0FBQTtBQUNBLEVBQUFBLGtDQUFBO0FBQ0EsRUFBQUEsa0NBQUE7QUFKVSxTQUFBQTtBQUFBLEdBQUE7QUFPTCxJQUFNLGNBQU4sTUFBa0I7QUFBQSxFQUl2QixZQUFZLE1BQXVCLFNBQWlCO0FBQ2xELFNBQUssVUFBVTtBQUNmLFNBQUssT0FBTztBQUFBLEVBQ2Q7QUFDRjsiLAogICJuYW1lcyI6IFsiU3RpY2t5RXJyb3JUeXBlIl0KfQo=
