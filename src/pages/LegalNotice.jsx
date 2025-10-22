import { useTranslation } from 'react-i18next';
import './LegalNotice.css';

const LegalNotice = () => {
  const { i18n } = useTranslation();

  return (
    <div className="legal-notice-page">
      <div className="container">
        {i18n.language === 'fr' ? (
          <>
            <h1>Mentions légales</h1>

            <section>
              <h2>Informations générales</h2>
              <p>
                RegistreDuQuebec.com est une plateforme privée indépendante ayant pour mission de rendre plus accessible l'information sur les entreprises québécoises et de faciliter la visibilité des commerces locaux.
              </p>
              <p>
                Le site permet aux entreprises de revendiquer, corriger et enrichir leur fiche, afin de maintenir des informations exactes et à jour.
              </p>
            </section>

            <section>
              <h2>Sources des données</h2>
              <p>
                Certaines informations de base affichées sur ce site proviennent de sources publiques, notamment le <strong>Registraire des entreprises du Québec (REQ)</strong>.
              </p>
              <p>
                Ces données sont publiées en vertu de la <em>Loi sur la publicité légale des entreprises</em> (RLRQ, c. P-44.1) et sont accessibles à toute personne.
              </p>
              <p>
                Les données sont ensuite enrichies et mises à jour par nos soins et/ou par les entreprises elles-mêmes.
              </p>
              <p>
                <strong>RegistreDuQuebec.com n'est pas affilié ni endossé par le gouvernement du Québec, le Registraire des entreprises du Québec, ni aucun organisme public.</strong>
              </p>
            </section>

            <section>
              <h2>Droits et responsabilités</h2>
              <p>
                Les entreprises peuvent demander la correction ou la suppression de leurs informations via la section "Revendiquer mon entreprise".
              </p>
              <p>
                L'utilisation du site implique l'acceptation de nos Conditions d'utilisation et de notre Politique de confidentialité (conforme à la Loi 25 sur la protection des renseignements personnels).
              </p>
              <p>
                Toute reproduction massive ou automatisée du contenu de ce site sans autorisation écrite est interdite.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>Pour toute question juridique ou demande liée à une fiche d'entreprise :</p>
              <p>
                📧 <a href="mailto:support@registreduquebec.com">support@registreduquebec.com</a>
              </p>
              <p>
                📍 Vaudreuil-Dorion, Québec, Canada
              </p>
            </section>
          </>
        ) : (
          <>
            <h1>Legal Notice</h1>

            <section>
              <h2>General information</h2>
              <p>
                RegistreDuQuebec.com is an independent private platform designed to make information about Quebec businesses more accessible and to help local companies gain visibility.
              </p>
              <p>
                The website allows businesses to claim, correct, and enrich their profile to ensure that data remains accurate and up to date.
              </p>
            </section>

            <section>
              <h2>Data sources</h2>
              <p>
                Some of the basic information displayed on this site comes from public sources, including the <strong>Registraire des entreprises du Québec (REQ)</strong>.
              </p>
              <p>
                These data are published under the <em>Act respecting the legal publicity of enterprises</em> (RLRQ, c. P-44.1) and are publicly accessible.
              </p>
              <p>
                The data are enhanced and updated by our team and/or by business owners themselves.
              </p>
              <p>
                <strong>RegistreDuQuebec.com is not affiliated with or endorsed by the Government of Quebec, the Registraire des entreprises du Québec, or any public agency.</strong>
              </p>
            </section>

            <section>
              <h2>Rights and responsibilities</h2>
              <p>
                Businesses can request the correction or removal of their information through the "Claim My Business" section.
              </p>
              <p>
                Use of this website constitutes acceptance of our Terms of Use and Privacy Policy (compliant with Quebec's Law 25 on personal data protection).
              </p>
              <p>
                Any massive or automated reproduction of the content of this site without prior written consent is strictly prohibited.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>For any legal question or business listing request:</p>
              <p>
                📧 <a href="mailto:support@registreduquebec.com">support@registreduquebec.com</a>
              </p>
              <p>
                📍 Vaudreuil-Dorion, Quebec, Canada
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default LegalNotice;
