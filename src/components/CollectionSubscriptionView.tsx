import { StyleSheet } from 'react-native';
import CollectionDetailTile from './CollectionDetailTile';
import CalendarIcon from './icons/Calendar';
import FileIcon from './icons/File';
import MoneyIcon from './icons/Money';
import UserIcon from './icons/User';
import Row from './Row';

const CollectionSubscriptionView = ({
  merchantName,
  frequency,
  amount,
  startDate,
  reference,
}: {
  merchantName: string;
  frequency: string;
  amount: string;
  startDate: string;
  reference: string;
}) => {
  return (
    <>
      <Row style={styles.row}>
        <CollectionDetailTile
          title="Debitor"
          subtitle={merchantName}
          icon={<UserIcon style={styles.icon} />}
        />
        <CollectionDetailTile
          title="Frequency"
          subtitle={frequency}
          icon={<CalendarIcon style={styles.icon} />}
        />
      </Row>
      <Row style={styles.row}>
        <CollectionDetailTile
          title="Amount"
          subtitle={`₦${amount}`}
          icon={<MoneyIcon style={styles.icon} />}
        />
        <CollectionDetailTile
          title="Start"
          subtitle={startDate}
          icon={<CalendarIcon style={styles.icon} />}
        />
      </Row>
      <Row style={styles.row}>
        <CollectionDetailTile
          title="Reference"
          subtitle={reference}
          icon={<FileIcon style={styles.icon} />}
        />
      </Row>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flex: 0,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
});
export default CollectionSubscriptionView;
