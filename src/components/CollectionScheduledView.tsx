import { StyleSheet } from 'react-native';
import CollectionDetailTile from './CollectionDetailTile';
import CalendarIcon from './icons/Calendar';
import FileIcon from './icons/File';
import MoneyIcon from './icons/Money';
import UserIcon from './icons/User';
import Row from './Row';

const CollectionScheduledView = ({
  merchantName,
  duration,
  debitLimit,
  monthlyLimit,
  reference,
}: {
  merchantName: string;
  duration: string;
  debitLimit: string;
  monthlyLimit: string;
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
          title="Duration"
          subtitle={duration}
          icon={<CalendarIcon style={styles.icon} />}
        />
      </Row>
      <Row style={styles.row}>
        <CollectionDetailTile
          title="Total debit limit"
          subtitle={`₦${debitLimit}`}
          icon={<MoneyIcon style={styles.icon} />}
        />
        <CollectionDetailTile
          title="Monthly debit limit"
          subtitle={`₦${monthlyLimit}`}
          icon={<MoneyIcon style={styles.icon} />}
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

export default CollectionScheduledView;
