import { NavigatorScreenParams } from '@react-navigation/native';
import { NetworkDevice, Subscriber, MpesaTransaction } from './models';

export type MainTabParamList = {
  Dashboard: undefined;
  Operations: undefined;
  Customers: undefined;
  Support: undefined;
  Platform: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  DeviceDetail: { device: NetworkDevice };
  SubscriberDetail: { subscriber: Subscriber };
  TransactionDetail: { transaction: MpesaTransaction };
  VoucherGenerator: undefined;
};
