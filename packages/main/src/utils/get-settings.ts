import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'fs';
import {join} from 'path';
import type {SettingOptions} from '../../../shared/types/common';
import {getChromePath} from '../fingerprint/device';
import {app} from 'electron';
import {CONFIG_FILE_PATH} from '../constants';
export const getSettings = (): SettingOptions => {
  const configFilePath = CONFIG_FILE_PATH;
  const isMac = process.platform === 'darwin';
  const defaultCachePath = isMac
    ? `${app.getPath('documents')}/ChromePowerCache`
    : join(app.getPath('appData'), 'ChromePowerCache');
  let settings = {
    profileCachePath: defaultCachePath,
    useLocalChrome: true,
    localChromePath: '',
    chromiumBinPath: '',
    automationConnect: false,
    browserName: 'Google Chrome',
  };

  try {
    if (existsSync(configFilePath)) {
      const fileContent = readFileSync(configFilePath, 'utf8');
      settings = JSON.parse(fileContent);
    } else {
      if (!existsSync(defaultCachePath)) {
        mkdirSync(defaultCachePath, {recursive: true, mode: 0o755});
      }
      writeFileSync(configFilePath, JSON.stringify(settings), 'utf8');
    }

    if (!existsSync(settings.profileCachePath)) {
      mkdirSync(settings.profileCachePath, {recursive: true, mode: 0o755});
    }
  } catch (error) {
    console.error('Error handling the settings file:', error);
  }

  if (!settings.localChromePath) {
    settings.localChromePath = getChromePath() as string;
  }
  settings.useLocalChrome = true;
  if (!settings.chromiumBinPath || settings.chromiumBinPath === 'Chrome-bin\\chrome.exe') {
    if (import.meta.env.DEV) {
      settings.chromiumBinPath = 'Chrome-bin\\chrome.exe';
    } else {
      settings.chromiumBinPath = join(process.resourcesPath, 'Chrome-bin', 'chrome.exe');
    }
  }
  return settings;
};
