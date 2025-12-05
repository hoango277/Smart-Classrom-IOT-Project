import mqtt from 'mqtt';

const getEnv = (key, fallback) => {
  const value =
    import.meta?.env?.[key] ??
    (typeof process !== 'undefined' ? process.env?.[key] : undefined);
  return value !== undefined ? value : fallback;
};

const mqttHost = getEnv('VITE_MQTT_HOST', getEnv('MQTT_HOST'));
const mqttPort = Number(
  getEnv('VITE_MQTT_WEB_SOCKET_PORT', getEnv('MQTT_WEB_SOCKET_PORT', 8884))
);
const mqttUser = getEnv('VITE_MQTT_USER', getEnv('MQTT_USER'));
const mqttPass = getEnv('VITE_MQTT_PASS', getEnv('MQTT_PASS'));
const mqttClientId = getEnv(
  'VITE_MQTT_CLIENT_ID',
  getEnv('MQTT_CLIENT_ID', 'smart_classroom_frontend')
);
const maxTopicLength =
  Number(getEnv('VITE_MAX_TOPIC_LENGTH', getEnv('MAX_TOPIC_LENGTH', 96))) || 96;

export const topics = {
  events: getEnv('VITE_TOPIC_EVENTS', getEnv('TOPIC_EVENTS')),
  doorCmd: getEnv(
    'VITE_TOPIC_BASE_DOOR_CMD',
    getEnv('TOPIC_BASE_DOOR_CMD', 'classroom/door/')
  ),
  windowCmd: getEnv(
    'VITE_TOPIC_BASE_WINDOW_CMD',
    getEnv('TOPIC_BASE_WINDOW_CMD', 'classroom/window/')
  ),
  lightCmd: getEnv(
    'VITE_TOPIC_BASE_LIGHT_CMD',
    getEnv('TOPIC_BASE_LIGHT_CMD', 'classroom/light/')
  ),
  alarmCmd: getEnv(
    'VITE_TOPIC_BASE_ALARM_CMD',
    getEnv('TOPIC_BASE_ALARM_CMD', 'classroom/alarm/')
  ),
};

if (!mqttHost) {
  throw new Error(
    'MQTT host is missing. Check VITE_MQTT_HOST (or MQTT_HOST) in your .env file.'
  );
}

let client = null;
let connectPromise = null;
const logError = (error) => console.error('[MQTT] error', error);

const buildBrokerUrl = () => `wss://${mqttHost}:${mqttPort}/mqtt`;

const removeListener = (event, handler) => {
  if (!client) return;
  if (typeof client.off === 'function') {
    client.off(event, handler);
  } else {
    client.removeListener(event, handler);
  }
};

const ensureTopic = (topic) => {
  if (!topic) {
    throw new Error('MQTT topic is required');
  }
  if (topic.length > maxTopicLength) {
    throw new Error(
      `MQTT topic length exceeds limit (${topic.length}/${maxTopicLength}): ${topic}`
    );
  }
};

const connect = () => {
  if (client?.connected) {
    return Promise.resolve(client);
  }
  if (connectPromise) {
    return connectPromise;
  }

  const url = buildBrokerUrl();

  connectPromise = new Promise((resolve, reject) => {
    client = mqtt.connect(url, {
      clientId: mqttClientId,
      clean: true,
      reconnectPeriod: 3000,
      connectTimeout: 20000,
      username: mqttUser,
      password: mqttPass,
      keepalive: 60,
      resubscribe: true,
    });

    const onConnect = () => {
      removeListener('error', onError);
      removeListener('connect', onConnect);
      resolve(client);
      client?.on('error', logError);
    };

    const onError = (error) => {
      removeListener('connect', onConnect);
      removeListener('error', onError);
      connectPromise = null;
      reject(error);
    };

    client.on('connect', onConnect);
    client.on('error', onError);
    client.on('close', () => {
      connectPromise = null;
    });
  });

  return connectPromise;
};

const ensureClient = async () => {
  if (client?.connected) {
    return client;
  }
  return connect();
};

const publish = async (topic, payload, options = {}) => {
  ensureTopic(topic);
  const mqttClient = await ensureClient();

  return new Promise((resolve, reject) => {
    const message =
      typeof payload === 'string' ? payload : JSON.stringify(payload);

    mqttClient.publish(
      topic,
      message,
      { qos: 0, retain: false, ...options },
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

const subscribe = async (topic, options = {}) => {
  ensureTopic(topic);
  const mqttClient = await ensureClient();

  return new Promise((resolve, reject) => {
    mqttClient.subscribe(topic, options, (error, granted) => {
      if (error) {
        reject(error);
      } else {
        resolve(granted);
      }
    });
  });
};

const unsubscribe = async (topic) => {
  ensureTopic(topic);
  if (!client) return;

  await new Promise((resolve, reject) => {
    client.unsubscribe(topic, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const disconnect = () => {
  if (client) {
    client.end(true);
    client = null;
    connectPromise = null;
  }
};

const on = (event, handler) => {
  if (!client) return;
  client.on(event, handler);
};

export const mqttService = {
  connect,
  publish,
  subscribe,
  unsubscribe,
  disconnect,
  on,
  getClient: () => client,
  isConnected: () => Boolean(client?.connected),
  topics,
};

export default mqttService;
