import { IonContent } from "@ionic/react";
import { useI18n } from '../i18n';

export const FilterModal = ({ filterCriteria, setFilterCriteria, dismiss, filters }) => {
  const { t } = useI18n();

  const filterProducts = (filter) => {
    setFilterCriteria(filter);
    dismiss();
  };

  return (
    <IonContent style={{ '--background': '#FBF8F5' }}>
      <div style={{ padding: '1rem 1.25rem' }}>
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.6rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#5A2A38',
            margin: '0 0 1rem',
          }}
        >
          {t('filter.title')}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              className={`sucre-btn sucre-btn-chip${filterCriteria === f ? ' is-active' : ''}`}
              onClick={() => filterProducts(f)}
              style={{
                borderRadius: '8px',
                padding: '7px 16px',
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {t(`filters.${f}`, null, f)}
            </button>
          ))}
        </div>
      </div>
    </IonContent>
  );
};