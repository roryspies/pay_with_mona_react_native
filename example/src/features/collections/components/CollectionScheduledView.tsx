import CollectionDetailTile from './CollectionDetailTile';
import Row from '../../../components/Row';

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
      <Row style={{ flex: 0 }}>
        <CollectionDetailTile
          title="Debitor"
          subtitle={merchantName}
          icon={require('../../../assets/user.png')}
        />
        <CollectionDetailTile
          title="Duration"
          subtitle={duration}
          icon={require('../../../assets/calendar.png')}
        />
      </Row>
      <Row style={{ flex: 0 }}>
        <CollectionDetailTile
          title="Total debit limit"
          subtitle={`₦${debitLimit}`}
          icon={require('../../../assets/collection_money.png')}
        />
        <CollectionDetailTile
          title="Monthly debit limit"
          subtitle={`₦${monthlyLimit}`}
          icon={require('../../../assets/collection_money.png')}
        />
      </Row>
      <Row style={{ flex: 0 }}>
        <CollectionDetailTile
          title="Reference"
          subtitle={reference}
          icon={require('../../../assets/files.png')}
        />
      </Row>
    </>
  );
};

export default CollectionScheduledView;
