import mqttService, { topics } from './mqtt.js';

const normalizeBase = (base) => (base?.endsWith('/') ? base : `${base}/`);

const commandTopics = {
  door: {
    base: normalizeBase(topics.doorCmd),
    allowed: ['open', 'close', 'stop'],
  },
  window: {
    base: normalizeBase(topics.windowCmd),
    allowed: ['open', 'close', 'stop'],
  },
  light: {
    base: normalizeBase(topics.lightCmd),
    allowed: ['on', 'off', 'toggle'],
  },
  alarm: {
    base: normalizeBase(topics.alarmCmd),
    allowed: ['on', 'off', 'toggle'],
  },
};

const ensureDeviceId = (deviceId) => {
  const numericId = Number(deviceId);
  if (!Number.isInteger(numericId) || numericId < 0) {
    throw new Error('Device id must be a non-negative integer (0-based).');
  }
  return numericId;
};

const buildCommandTopic = (type, deviceId) => {
  const config = commandTopics[type];
  if (!config?.base) {
    throw new Error(`Missing topic base for ${type} commands.`);
  }

  return `${config.base}${deviceId}/cmd`;
};

const validateAction = (type, action) => {
  const command = action?.toLowerCase();
  const allowed = commandTopics[type]?.allowed || [];

  if (!allowed.includes(command)) {
    throw new Error(
      `Invalid ${type} command "${action}". Allowed: ${allowed.join(', ')}.`
    );
  }

  return command;
};

export const publishCommand = async (type, deviceId, action) => {
  const normalizedType = type?.toLowerCase();
  if (!commandTopics[normalizedType]) {
    throw new Error(
      `Unsupported command type "${type}". Use door, window, light, or alarm.`
    );
  }

  const id = ensureDeviceId(deviceId);
  const payload = validateAction(normalizedType, action);
  const topic = buildCommandTopic(normalizedType, id);

  await mqttService.publish(topic, payload);
  return { topic, payload };
};

export const publishDoorCommand = (deviceId, action) =>
  publishCommand('door', deviceId, action);

export const publishWindowCommand = (deviceId, action) =>
  publishCommand('window', deviceId, action);

export const publishLightCommand = (deviceId, action) =>
  publishCommand('light', deviceId, action);

export const publishAlarmCommand = (deviceId, action) =>
  publishCommand('alarm', deviceId, action);

export default {
  publishCommand,
  publishDoorCommand,
  publishWindowCommand,
  publishLightCommand,
  publishAlarmCommand,
};
