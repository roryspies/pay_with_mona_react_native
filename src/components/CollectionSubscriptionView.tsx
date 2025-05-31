import CollectionDetailTile from './CollectionDetailTile';
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
      <Row style={{ flex: 0 }}>
        <CollectionDetailTile
          title="Debitor"
          subtitle={merchantName}
          icon={require('../assets/user.png')}
        />
        <CollectionDetailTile
          title="Frequency"
          subtitle={frequency}
          icon={require('../assets/calendar.png')}
        />
      </Row>
      <Row style={{ flex: 0 }}>
        <CollectionDetailTile
          title="Amount"
          subtitle={`₦${amount}`}
          icon={require('../assets/collection_money.png')}
        />
        <CollectionDetailTile
          title="Start"
          subtitle={startDate}
          icon={require('../assets/calendar.png')}
        />
      </Row>
      <Row style={{ flex: 0 }}>
        <CollectionDetailTile
          title="Reference"
          subtitle={reference}
          icon={require('../assets/files.png')}
        />
      </Row>
    </>
  );
};
export default CollectionSubscriptionView;
