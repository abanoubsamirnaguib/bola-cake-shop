import { IonButton } from '@ionic/react';
import { useI18n } from '../i18n';

export const LanguageToggle = () => {
  const { toggleLanguage, t } = useI18n();

  return (
    <IonButton
      fill="clear"
      onClick={toggleLanguage}
      style={{
        '--background': 'transparent',
        '--background-hover': 'rgba(232, 190, 183, 0.22)',
        '--background-activated': 'rgba(232, 190, 183, 0.32)',
        '--background-focused': 'rgba(232, 190, 183, 0.22)',
        '--color': '#C99A75',
        '--color-hover': '#5A2A38',
        '--color-activated': '#5A2A38',
        '--ripple-color': 'rgba(90, 42, 56, 0.1)',
        '--border-radius': '6px',
        '--padding-start': '8px',
        '--padding-end': '8px',
        fontSize: '0.65rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}
    >
      {t('languageToggle')}
    </IonButton>
  );
};
