import { useTranslation } from 'react-i18next';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const { i18n } = useTranslation();

  return (
    <div className="privacy-policy-page">
      <div className="container">
        {i18n.language === 'fr' ? (
          <>
            <h1>Politique de confidentialité</h1>

            <section>
              <h2>Introduction</h2>
              <p>
                La protection de vos données personnelles est une priorité pour <strong>RegistreDuQuebec.com</strong>.
                Cette politique de confidentialité explique quelles informations nous collectons, comment nous les utilisons,
                et vos droits en vertu de la <strong>Loi 25</strong> sur la protection des renseignements personnels au Québec.
              </p>
              <p>
                <strong>Dernière mise à jour :</strong> Janvier 2025
              </p>
            </section>

            <section>
              <h2>Informations collectées</h2>
              <h3>Informations que vous nous fournissez</h3>
              <p>Lorsque vous utilisez notre plateforme, nous pouvons collecter :</p>
              <ul>
                <li>Nom et prénom (si vous créez un compte)</li>
                <li>Adresse courriel</li>
                <li>Numéro de téléphone (facultatif)</li>
                <li>Informations d'entreprise (nom, adresse, NEQ, description, etc.)</li>
                <li>Photos et logos uploadés</li>
              </ul>

              <h3>Informations collectées automatiquement</h3>
              <p>Lors de votre navigation, nous collectons :</p>
              <ul>
                <li>Adresse IP</li>
                <li>Type de navigateur et appareil</li>
                <li>Pages visitées et durée de visite</li>
                <li>Données de navigation (cookies essentiels uniquement)</li>
              </ul>

              <h3>Informations publiques</h3>
              <p>
                Certaines données d'entreprises proviennent de sources publiques gouvernementales (Registraire des entreprises du Québec)
                et sont déjà accessibles au public selon la loi.
              </p>
            </section>

            <section>
              <h2>Utilisation des données</h2>
              <p>Nous utilisons vos données uniquement pour :</p>
              <ul>
                <li>Fournir et améliorer nos services</li>
                <li>Gérer votre compte utilisateur</li>
                <li>Permettre aux entreprises de revendiquer et gérer leurs fiches</li>
                <li>Répondre à vos demandes de support</li>
                <li>Assurer la sécurité et prévenir la fraude</li>
                <li>Respecter nos obligations légales</li>
              </ul>
              <p>
                <strong>Nous ne vendons jamais vos données personnelles à des tiers.</strong>
              </p>
            </section>

            <section>
              <h2>Cookies et technologies similaires</h2>
              <p>
                Nous utilisons uniquement des <strong>cookies essentiels</strong> nécessaires au bon fonctionnement du site :
              </p>
              <ul>
                <li>Cookies de session (authentification)</li>
                <li>Préférences de langue</li>
                <li>Consentement aux cookies</li>
              </ul>
              <p>
                <strong>Nous n'utilisons pas de cookies publicitaires, de tracking ou d'analyse comportementale.</strong>
              </p>
            </section>

            <section>
              <h2>Partage des données</h2>
              <p>Vos données personnelles ne sont partagées qu'avec :</p>
              <ul>
                <li><strong>Supabase</strong> (hébergement base de données - serveurs au Canada)</li>
                <li><strong>Google Places API</strong> (enrichissement données entreprises - données publiques uniquement)</li>
                <li>Autorités légales (si requis par la loi)</li>
              </ul>
              <p>
                Aucun partage à des fins commerciales, publicitaires ou marketing.
              </p>
            </section>

            <section>
              <h2>Vos droits (Loi 25)</h2>
              <p>En vertu de la Loi 25 sur la protection des renseignements personnels, vous avez le droit de :</p>
              <ul>
                <li><strong>Accéder</strong> à vos données personnelles</li>
                <li><strong>Rectifier</strong> vos données si elles sont inexactes</li>
                <li><strong>Supprimer</strong> votre compte et vos données</li>
                <li><strong>Retirer</strong> votre consentement à tout moment</li>
                <li><strong>Porter plainte</strong> auprès de la Commission d'accès à l'information du Québec (CAI)</li>
              </ul>
              <p>
                Pour exercer vos droits, contactez-nous : <a href="mailto:info@h1site.com">info@h1site.com</a>
              </p>
            </section>

            <section>
              <h2>Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
              </p>
              <ul>
                <li>Chiffrement des données en transit (HTTPS/SSL)</li>
                <li>Authentification sécurisée</li>
                <li>Accès restreint aux données sensibles</li>
                <li>Sauvegardes régulières</li>
              </ul>
            </section>

            <section>
              <h2>Conservation des données</h2>
              <p>
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services
                ou respecter nos obligations légales. Vous pouvez demander la suppression de votre compte à tout moment.
              </p>
            </section>

            <section>
              <h2>Modifications de cette politique</h2>
              <p>
                Nous nous réservons le droit de modifier cette politique de confidentialité.
                Toute modification sera publiée sur cette page avec la date de mise à jour.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>Pour toute question concernant cette politique de confidentialité ou vos données personnelles :</p>
              <p>
                📧 <a href="mailto:info@h1site.com">info@h1site.com</a>
              </p>
              <p>
                📍 Vaudreuil-Dorion, Québec, Canada
              </p>
            </section>
          </>
        ) : (
          <>
            <h1>Privacy Policy</h1>

            <section>
              <h2>Introduction</h2>
              <p>
                Protecting your personal data is a priority for <strong>RegistreDuQuebec.com</strong>.
                This privacy policy explains what information we collect, how we use it,
                and your rights under Quebec's <strong>Law 25</strong> on the protection of personal information.
              </p>
              <p>
                <strong>Last updated:</strong> January 2025
              </p>
            </section>

            <section>
              <h2>Information Collected</h2>
              <h3>Information you provide to us</h3>
              <p>When you use our platform, we may collect:</p>
              <ul>
                <li>First and last name (if you create an account)</li>
                <li>Email address</li>
                <li>Phone number (optional)</li>
                <li>Business information (name, address, NEQ, description, etc.)</li>
                <li>Uploaded photos and logos</li>
              </ul>

              <h3>Automatically collected information</h3>
              <p>During your browsing, we collect:</p>
              <ul>
                <li>IP address</li>
                <li>Browser type and device</li>
                <li>Pages visited and visit duration</li>
                <li>Navigation data (essential cookies only)</li>
              </ul>

              <h3>Public information</h3>
              <p>
                Some business data comes from government public sources (Registraire des entreprises du Québec)
                and is already publicly accessible by law.
              </p>
            </section>

            <section>
              <h2>Use of Data</h2>
              <p>We use your data only to:</p>
              <ul>
                <li>Provide and improve our services</li>
                <li>Manage your user account</li>
                <li>Allow businesses to claim and manage their listings</li>
                <li>Respond to your support requests</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with our legal obligations</li>
              </ul>
              <p>
                <strong>We never sell your personal data to third parties.</strong>
              </p>
            </section>

            <section>
              <h2>Cookies and Similar Technologies</h2>
              <p>
                We only use <strong>essential cookies</strong> necessary for the proper functioning of the site:
              </p>
              <ul>
                <li>Session cookies (authentication)</li>
                <li>Language preferences</li>
                <li>Cookie consent</li>
              </ul>
              <p>
                <strong>We do not use advertising, tracking, or behavioral analysis cookies.</strong>
              </p>
            </section>

            <section>
              <h2>Data Sharing</h2>
              <p>Your personal data is only shared with:</p>
              <ul>
                <li><strong>Supabase</strong> (database hosting - servers in Canada)</li>
                <li><strong>Google Places API</strong> (business data enrichment - public data only)</li>
                <li>Legal authorities (if required by law)</li>
              </ul>
              <p>
                No sharing for commercial, advertising, or marketing purposes.
              </p>
            </section>

            <section>
              <h2>Your Rights (Law 25)</h2>
              <p>Under Law 25 on the protection of personal information, you have the right to:</p>
              <ul>
                <li><strong>Access</strong> your personal data</li>
                <li><strong>Rectify</strong> your data if it is inaccurate</li>
                <li><strong>Delete</strong> your account and data</li>
                <li><strong>Withdraw</strong> your consent at any time</li>
                <li><strong>File a complaint</strong> with the Commission d'accès à l'information du Québec (CAI)</li>
              </ul>
              <p>
                To exercise your rights, contact us: <a href="mailto:info@h1site.com">info@h1site.com</a>
              </p>
            </section>

            <section>
              <h2>Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your data:
              </p>
              <ul>
                <li>Data encryption in transit (HTTPS/SSL)</li>
                <li>Secure authentication</li>
                <li>Restricted access to sensitive data</li>
                <li>Regular backups</li>
              </ul>
            </section>

            <section>
              <h2>Data Retention</h2>
              <p>
                We retain your personal data as long as necessary to provide our services
                or comply with our legal obligations. You can request deletion of your account at any time.
              </p>
            </section>

            <section>
              <h2>Changes to this Policy</h2>
              <p>
                We reserve the right to modify this privacy policy.
                Any changes will be posted on this page with the update date.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>For any questions regarding this privacy policy or your personal data:</p>
              <p>
                📧 <a href="mailto:info@h1site.com">info@h1site.com</a>
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

export default PrivacyPolicy;
