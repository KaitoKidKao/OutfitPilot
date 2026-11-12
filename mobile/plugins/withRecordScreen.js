const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withRecordScreen(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    if (!androidManifest["uses-permission"]) {
      androidManifest["uses-permission"] = [];
    }

    const permissions = [
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION",
    ];

    permissions.forEach((permission) => {
      if (
        !androidManifest["uses-permission"].some(
          (p) => p.$ && p.$["android:name"] === permission
        )
      ) {
        androidManifest["uses-permission"].push({
          $: { "android:name": permission },
        });
      }
    });

    const application = androidManifest.application[0];
    if (!application.service) {
      application.service = [];
    }

    const serviceName = "com.hbisoft.hbrecorder.ScreenRecordService";
    const existingService = application.service.find(
      (s) => s.$ && s.$["android:name"] === serviceName
    );

    if (existingService) {
      existingService.$["android:foregroundServiceType"] = "mediaProjection";
      existingService.$["android:exported"] = "false";
    } else {
      application.service.push({
        $: {
          "android:name": serviceName,
          "android:foregroundServiceType": "mediaProjection",
          "android:exported": "false",
        },
      });
    }

    return config;
  });
};
