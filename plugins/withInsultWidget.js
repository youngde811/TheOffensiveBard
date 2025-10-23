const { withEntitlementsPlist } = require("@expo/config-plugins");

/**
 * Expo config plugin to configure app groups for widget data sharing
 *
 * Note: The widget extension target must be added manually in Xcode.
 * This plugin only configures the app groups entitlement.
 */
const withInsultWidget = (config) => {
  // Add app groups entitlement to main app
  config = withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.security.application-groups"] = [
      "group.com.bosshog811.TheInsolentBard",
    ];
    return config;
  });

  return config;
};

module.exports = withInsultWidget;
