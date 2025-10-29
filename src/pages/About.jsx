import { useTranslation } from 'react-i18next';
import './About.css';

const About = () => {
  const { i18n } = useTranslation();

  return (
    <div className="about-page">
      <div className="container">
        <div className="about-header">
          <img src="/images/logos/logoblue.webp" alt="Registre du Québec" className="about-logo" />
          <h1>{i18n.language === 'fr' ? 'À propos du Registre du Québec' : 'About Quebec Business Directory'}</h1>
        </div>

        {i18n.language === 'fr' ? (
          <>
            <section>
              <h2>Notre mission</h2>
              <p>
                Le Registre du Québec est une plateforme privée indépendante dédiée à rendre l'information sur les entreprises québécoises plus accessible et à faciliter la visibilité des commerces locaux à travers la province.
              </p>
              <p>
                Avec plus de <strong>600 000 entreprises répertoriées</strong>, nous offrons la plus grande base de données d'entreprises du Québec, permettant aux consommateurs de trouver facilement les services et produits dont ils ont besoin, tout en aidant les entreprises à accroître leur visibilité en ligne.
              </p>
            </section>

            <section>
              <h2>Ce que nous offrons</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🔍</div>
                  <h3>Recherche avancée</h3>
                  <p>Trouvez des entreprises par nom, ville, région ou catégorie avec notre moteur de recherche puissant.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📍</div>
                  <h3>Navigation géographique</h3>
                  <p>Explorez les entreprises par ville et région à travers tout le Québec.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🏢</div>
                  <h3>Fiches détaillées</h3>
                  <p>Accédez aux coordonnées complètes, horaires, sites web et informations essentielles.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">✅</div>
                  <h3>Réclamation de fiche</h3>
                  <p>Les propriétaires peuvent revendiquer, mettre à jour et enrichir leur fiche gratuitement.</p>
                </div>
              </div>
            </section>

            <section>
              <h2>Pour les entreprises</h2>
              <p>
                Vous êtes propriétaire d'une entreprise québécoise? Réclamez gratuitement votre fiche pour :
              </p>
              <ul className="benefits-list">
                <li>✓ Mettre à jour vos coordonnées et horaires</li>
                <li>✓ Ajouter votre site web et réseaux sociaux</li>
                <li>✓ Gérer les informations de votre entreprise</li>
                <li>✓ Améliorer votre visibilité en ligne</li>
                <li>✓ Garder vos informations à jour en temps réel</li>
              </ul>
            </section>

            <section>
              <h2>Sources de données</h2>
              <p>
                Les informations de base proviennent de sources publiques, notamment le <strong>Registraire des entreprises du Québec (REQ)</strong>, publiées en vertu de la <em>Loi sur la publicité légale des entreprises</em> (RLRQ, c. P-44.1).
              </p>
              <p>
                Ces données sont ensuite enrichies et mises à jour régulièrement par notre équipe et par les entreprises elles-mêmes.
              </p>
              <p className="disclaimer">
                <strong>Note importante :</strong> RegistreDuQuebec.com n'est pas affilié ni endossé par le gouvernement du Québec, le Registraire des entreprises du Québec, ni aucun organisme public.
              </p>
            </section>

            <section>
              <h2>Rejoignez notre communauté</h2>
              <p>
                Connectez avec des milliers d'entrepreneurs québécois dans notre groupe Facebook. Partagez vos expériences, posez des questions et développez votre réseau professionnel.
              </p>
              <div className="cta-box">
                <a
                  href="https://www.facebook.com/groups/registreduquebec"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="btn-facebook-cta"
                >
                  <span className="fb-icon">f</span>
                  Rejoindre le groupe Facebook
                </a>
              </div>
            </section>

            <section>
              <h2>Contact</h2>
              <p>Pour toute question ou demande concernant votre fiche d'entreprise :</p>
              <div className="contact-info">
                <p>📧 <a href="mailto:info@h1site.com">info@h1site.com</a></p>
                <p>📍 Vaudreuil-Dorion, Québec, Canada</p>
              </div>
              <p className="powered-by">
                Propulsé par <a href="https://h1site.com" target="_blank" rel="noopener noreferrer">H1Site.com</a>
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2>Our Mission</h2>
              <p>
                Quebec Business Directory is an independent private platform dedicated to making information about Quebec businesses more accessible and facilitating the visibility of local businesses throughout the province.
              </p>
              <p>
                With over <strong>600,000 businesses listed</strong>, we offer the largest database of Quebec businesses, allowing consumers to easily find the services and products they need while helping businesses increase their online visibility.
              </p>
            </section>

            <section>
              <h2>What We Offer</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🔍</div>
                  <h3>Advanced Search</h3>
                  <p>Find businesses by name, city, region or category with our powerful search engine.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📍</div>
                  <h3>Geographic Navigation</h3>
                  <p>Explore businesses by city and region throughout Quebec.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🏢</div>
                  <h3>Detailed Listings</h3>
                  <p>Access complete contact information, hours, websites and essential details.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">✅</div>
                  <h3>Business Claim</h3>
                  <p>Owners can claim, update and enrich their listing for free.</p>
                </div>
              </div>
            </section>

            <section>
              <h2>For Businesses</h2>
              <p>
                Are you a Quebec business owner? Claim your listing for free to:
              </p>
              <ul className="benefits-list">
                <li>✓ Update your contact information and hours</li>
                <li>✓ Add your website and social media</li>
                <li>✓ Manage your business information</li>
                <li>✓ Improve your online visibility</li>
                <li>✓ Keep your information up to date in real-time</li>
              </ul>
            </section>

            <section>
              <h2>Data Sources</h2>
              <p>
                Basic information comes from public sources, including the <strong>Registraire des entreprises du Québec (REQ)</strong>, published under the <em>Act respecting the legal publicity of enterprises</em> (RLRQ, c. P-44.1).
              </p>
              <p>
                This data is then enriched and regularly updated by our team and by the businesses themselves.
              </p>
              <p className="disclaimer">
                <strong>Important note:</strong> RegistreDuQuebec.com is not affiliated with or endorsed by the Government of Quebec, the Registraire des entreprises du Québec, or any public agency.
              </p>
            </section>

            <section>
              <h2>Join Our Community</h2>
              <p>
                Connect with thousands of Quebec entrepreneurs in our Facebook group. Share experiences, ask questions and grow your professional network.
              </p>
              <div className="cta-box">
                <a
                  href="https://www.facebook.com/groups/registreduquebec"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="btn-facebook-cta"
                >
                  <span className="fb-icon">f</span>
                  Join Facebook Group
                </a>
              </div>
            </section>

            <section>
              <h2>Contact</h2>
              <p>For any questions or requests regarding your business listing:</p>
              <div className="contact-info">
                <p>📧 <a href="mailto:info@h1site.com">info@h1site.com</a></p>
                <p>📍 Vaudreuil-Dorion, Quebec, Canada</p>
              </div>
              <p className="powered-by">
                Powered by <a href="https://h1site.com" target="_blank" rel="noopener noreferrer">H1Site.com</a>
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default About;
