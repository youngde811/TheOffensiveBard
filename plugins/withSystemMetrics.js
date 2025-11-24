// Expo config plugin to add SystemMetrics native module to iOS project

// MIT License

// Copyright (c) 2023 David Young

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
// Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

const { withXcodeProject } = require("@expo/config-plugins");
const path = require("path");

/**
 * Expo config plugin to add SystemMetrics native module files to Xcode project
 */
const withSystemMetrics = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const projectRoot = config.modRequest.projectRoot;

    // Paths to the SystemMetrics files
    const swiftFile = path.join("SystemMetrics", "SystemMetrics.swift");
    const objcFile = path.join("SystemMetrics", "SystemMetrics.m");

    // Get the main app target
    const targets = xcodeProject.getTargetsByType("application");
    if (targets.length === 0) {
      console.warn("No application target found in Xcode project");
      return config;
    }

    const target = targets[0];
    const targetUuid = target.uuid;

    // Add Swift file to project
    if (!xcodeProject.hasFile(swiftFile)) {
      const swiftFileRef = xcodeProject.addSourceFile(
        swiftFile,
        { target: targetUuid },
        xcodeProject.findPBXGroupKey({ name: "TheInsolentBard" })
      );
      console.log("Added SystemMetrics.swift to Xcode project");
    }

    // Add Objective-C bridge file to project
    if (!xcodeProject.hasFile(objcFile)) {
      const objcFileRef = xcodeProject.addSourceFile(
        objcFile,
        { target: targetUuid },
        xcodeProject.findPBXGroupKey({ name: "TheInsolentBard" })
      );
      console.log("Added SystemMetrics.m to Xcode project");
    }

    return config;
  });
};

module.exports = withSystemMetrics;
