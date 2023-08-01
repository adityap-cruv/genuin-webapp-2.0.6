import React, { useState } from 'react'
import { Container } from 'react-bootstrap'
import { Layout } from '../components/layout/layout'
import { TopNav } from '../components/navbar/top_nav'
import dynamic from 'next/dynamic'

const DownloadAppPopup = dynamic(() => import('../components/download_app_popup'))

const Terms = () => {
  const [showDownloadAppPopup, setShowDownloadAppPopup] = useState(false)
  const handleShowDownloadAppPopup = () => setShowDownloadAppPopup(true)

  const handleCloseDownloadAppPopup = () => setShowDownloadAppPopup(false)
  const mainTitleStyle = {
    fontSize: '40px',
    fontWeight: '700',
    lineHeight: '45px',
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '40px',
    paddingBottom: '20px',
    textAlign: 'center'
  }

  const generalStyle = {
    fontSize: '16px',
    lineHeight: '24px',
    paddingLeft: '8px',
    paddingRight: '8px'
  }

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    lineHeight: '32px',
    paddingTop: '20px',
    paddingBottom: '20px'
  }

  const paddingStyle = {
    paddingLeft: '25px',
    paddingTop: '15px',
    paddingBottom: '15px'
  }

  return (
    <Layout className='overflow-auto'>
      <TopNav
        showGetAppModal={handleShowDownloadAppPopup}
        isContiner
        variant='light'
        backgroundColor='black'
      />
      <section className='bg-body h-100' style={{ paddingBottom: '20%', paddingTop: '10%' }}>
        <Container className='mt-3'>
          <p style={{ ...mainTitleStyle }}>
            Genuin, Inc. <br/>General Terms of Service
          </p>

          <div style={{ ...generalStyle, paddingBottom: '5%' }}>
            <p><b>Last Updated:</b> April 20, 2023</p>
            <p
              style={{
                paddingTop: '20px'
              }}>These General Terms of Service (these "<b>Terms of Service</b>") are between Genuin, Inc.
              ("<b>Genuin</b>," "<b>we</b>," "<b>us</b>," and "<b>our</b>") and anyone,
              whether on behalf of themselves or another entity ("<b>you</b>" or "<b>your</b>") and govern your
              registration and/or use of our application, product and the software made available there (our "<b>App</b>")
              as well as any other websites, subdomains, or services owned or controlled by Genuin (collectively, the
              "<b>Services</b>"). By using the App, you agree to follow and be bound by these Terms of Service, as well as
              the Privacy Policy and any other policies referenced herein. </p>

            <p
              style={{
                paddingTop: '20px'
              }}><b>ARBITRATION NOTICE: YOU AGREE THAT DISPUTES BETWEEN YOU AND GENUIN WILL BE RESOLVED BY BINDING, INDIVIDUAL
              ARBITRATION AND YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION. WE EXPLAIN
              SOME EXCEPTIONS AND HOW YOU CAN OPT OUT OF ARBITRATION BELOW.</b></p>

            <ol type="1" className='marker-style' style={{ paddingLeft: '30px' }}>
              <li>
                <p style={titleStyle}>Introduction</p>
                <ol type="a" style={paddingStyle}>
                  <li>These Terms of Service constitute a legal agreement and create a binding contract between you and Genuin. They
                    will start on the earlier of the date you accept them or begin using the Services and will continue until you
                    stop using the Services unless ended earlier as described in the Terms of Service. If you fail to comply with
                    the Terms of Service, or a User Agreement (defined below) we may suspend or terminate Your Account (defined
                    under Section II) as further described under Section XI.</li>
                  <li>Your use of the Services is governed by additional agreements and terms, including our community guidelines
                    our Privacy Policy and any third-party terms and conditions (each, a "<b>User Agreement</b>").
                    Therefore, <b>ALL OTHER AGREEMENTS ENTERED INTO SEPARATELY BETWEEN YOU AND GENUIN ARE DEEMED SUPPLEMENTARY
                      TERMS THAT ARE AN INTEGRAL PART OF THE TERMS OF SERVICE AND SHALL HAVE THE SAME LEGAL EFFECT. YOUR USE OF THE
                      SERVICES IS DEEMED YOUR ACCEPTANCE OF THE ABOVE SUPPLEMENTARY TERMS.</b></li>
                  <li>In the event of a conflict between a User Agreement and these Terms of Service, the User Agreement shall
                    control. </li>
                  <li>We may modify these Terms of Service or any additional terms that apply to the App or the Services. For
                    example, to reflect changes to the law or changes to the App. You should look at these Terms of Service
                    regularly and your continued use of the App will constitute your acceptance of any revisions to these Terms of
                    Service. We will post notice of modified additional terms in the applicable service. If you do not agree to the
                    modified terms for the App or the Services we offer, you should discontinue your use of the App and/or the
                    Services.</li>
                </ol>
              </li>
              <li>
                <p style={titleStyle}>Your Account</p>
                <ol type="a" style={paddingStyle}>
                  <li>In order to use the App, you must set up an account as a user ("<b>Your Account</b>"), subject to
                    these Terms of Service and any other applicable agreement with us.</li>
                  <li>In creating Your Account, you will be asked for your phone number. Your phone number will not be used for any
                    marketing messages. Your email, password, and phone number, whichever are applicable, are referred to
                    collectively as "<b>Login Credentials</b>". </li>
                  <li>You agree that you are responsible for all activities that occur under your Login Credentials.</li>
                  <li>You are responsible for maintaining the confidentiality of your Login Credentials.</li>
                  <li>By registering to use Your Account, you represent and warrant that:
                    <ol type="i" style={paddingStyle}>
                      <li>As an individual, you are at least 13;</li>
                      <li>As an individual, legal person, or other organization, you have full legal capacity and sufficient
                        authorizations to enter into these Terms of Service;</li>
                      <li>You have not been previously suspended or removed from using the App or the Services; </li>
                      <li>If you act as an employee or agent of a legal entity, and enter into these Terms of Service on their
                        behalf, you represent and warrant that you have all the necessary rights and authorizations to bind such
                        legal entity and to access and use the App and the Services on behalf of such legal entity;</li>
                      <li>You are not a sex offender; </li>
                      <li>Your use of the App and the Services will not violate any and all laws and regulations applicable to you
                        or the legal entity on whose behalf you are acting; and; </li>
                      <li>You will not use the Services to (each a, "<b>Prohibited Use</b>"):
                        <ol type="1" style={paddingStyle}>
                          <li>Impersonate others;</li>
                          <li>Do anything unlawful or fraudulent or for an illegal purpose;</li>
                          <li>Violate the Terms of Service;</li>
                          <li>Do anything to interfere with or impair the intended operation of the Services;</li>
                          <li>Attempt to create accounts or access or collect information in unauthorized ways, including, but not
                            limited to creating accounts or collecting information in an automated way without our express
                            permission; </li>
                          <li>Sell, license, or purchase any account or data obtained from us or the Services; </li>
                          <li>Send, use or upload any scripts, viruses or malicious code; </li>
                          <li>Post someone else’s private or confidential information without permission or do anything that
                            violates someone else&#39;s rights, including intellectual property rights (<em>e.g</em>., copyright
                            infringement, trademark infringement, counterfeit, or pirated goods). You may use someone else&#39;s
                            works under exceptions or limitations to copyright and related rights under applicable law. You
                            represent you own or have obtained all necessary rights to the content you post or share;</li>
                          <li>Attempt to decode, modify, circumvent, re-identify, de-anonymize, unscramble, unencrypt, or reverse
                            hash, or reverse-engineer translate, or create derivative works of, any part of the Services, including
                            the App or their components; or </li>
                          <li>Use the App to discriminate or encourage discrimination against people based on personal attributes
                            including race, ethnicity, color, national origin, religion, age, sex, sexual orientation, gender
                            identity, family status, disability, medical or genetic condition, or any other categories prohibited by
                            applicable law or regulation.</li>
                        </ol>
                      </li>
                    </ol>
                  </li>
                  <li>We reserve the right to change Your Account username or similar identifier for Your Account if we believe it
                    is appropriate or necessary (for example, if it infringes someone&#39;s intellectual property or impersonates
                    another user).</li>
                </ol>
              </li>
              <li>
                <p style={titleStyle}>Messaging</p>
                <ol type="a" style={paddingStyle}>
                  <li>By signing up for the Service, accepting these Terms of Service, and by providing a mobile phone number you
                    consent that we may contact you by text messaging ("<b>SMS</b>") (including by an automatic telephone
                    dialing system) at the mobile phone number you associate with Your Account. </li>
                  <li>As always, message and data rates may apply for any messages sent to you from us and to us from you. By
                    providing your consent to the SMS service, you approve any such rates and charges from your mobile provider and
                    agree that Genuin is not responsible for such rates and charges. If you have any questions about your text or
                    data plan, please contact your mobile provider. </li>
                  <li>To the maximum extent permitted by applicable law, you hereby agree that Genuin shall not be liable for any
                    direct, indirect, consequential, special, incidental, punitive or any other damages, even if we have been
                    advised of the possibility of such damage or loss, arising or resulting from or in any way relating to your use
                    of the SMS service. Furthermore, Genuin shall not be liable for the acts or omissions of third parties,
                    including but not limited to delays in the transmission of messages.</li>
                </ol>
              </li>
              <li>
                <p style={titleStyle}>Sharing Personal Information </p>
                <ol type="a" style={paddingStyle}>
                  <li>We do not share your information unless required to do so by law and/or unless we have your express consent to
                    do so or have another legal basis for sharing such information, <em>e.g.</em>, to complete a transaction
                    requested by you, or to prevent fraud. If we share your information with any third party we will do so in
                    accordance with our Privacy Policy.</li>
                  <li>We may contact any other financial institution, law enforcement or affected third parties (including other
                    users) and share details of any transactions you are associated with if we believe doing so may prevent
                    financial loss or a violation of law. Additional information is available in our Privacy Policy.</li>
                  <li>You must agree to the Privacy Policy to use the Services.</li>
                </ol>
              </li>
              <li>
                <p style={titleStyle}>Licenses</p>
                <ol type="a" style={paddingStyle}>
                  <li>Our License to You <ol type="i" style={paddingStyle}>
                    <li>Subject to your compliance with the Terms of Service and all other User Agreements, we grant you a
                      limited, nonexclusive, nontransferable, non-sublicensable license to access and use the Services solely to
                      access and use the App, but only to the extent as permitted herein (the "<b>Genuin License</b>").
                      You agree you have no other rights beyond the Genuin License. You agree you will not copy, transmit,
                      distribute, sell, resell, license, de-compile, reverse engineer, disassemble, modify, publish, participate
                      in the transfer or sale of, create derivative works from, perform, display, incorporate into another
                      website, or in any other way exploit any content or other part of the App for any purpose. You also agree
                      that you will not frame or display any part of the App without our prior written permission and that you
                      will not use our trademarks without our permission.</li>
                  </ol>
                  </li>
                  <li>Your License to Us<ol type="i" style={paddingStyle}>
                    <li>You grant Genuin a non-exclusive, transferable, sublicensable, royalty-free, worldwide license to: host,
                      use, distribute, modify, run, copy, publicly perform or display, translate, and create derivative works of
                      any information, data, and other content made available by you or on your behalf in connection with the
                      Services (collectively, "<b>Your Content</b>") for any business purpose in connection with
                      operating, providing, or improving the Services. This license remains in effect even if you stop using the
                      App. Without limitation, your license to us includes: the right to incorporate Your Content into other parts
                      of the Services, the right to attribute the source of Your Content using your name, trademarks, or logos;
                      the right to use Your Content for promotional purposes, and the right to analyze Your Content (including to
                      make sure you’re complying with these Terms and all other applicable terms and policies).</li>
                    <li>If you owned Your Content before providing it to us, you will continue owning it after providing it to us,
                      subject to any rights granted in these Terms or any other applicable terms or policies and any access you
                      provide to others by sharing it via Platform.</li>
                    <li>You agree that we can download and install updates to the Service on your device.</li>
                  </ol>
                  </li>
                </ol>
              </li>
              <li>
                <p style={titleStyle}>Deletions and Cancelations</p>
                <ol type="a" style={paddingStyle}>
                  <li>Deleting Your Content
                    <ol type="i" style={paddingStyle}>
                      <li>You can delete Your Content that you share, post, and upload at any time. When you request to delete Your
                        Content or Your Account, the deletion process may take up to 90 days to delete. While the deletion process
                        for Your Content is being undertaken, Your Content is no longer visible to other users, but remains subject
                        to these Terms of Service and our Privacy Policy. After Your Content is deleted, it may take us up to
                        another 90 days to remove it from backups and disaster recovery systems.</li>
                      <li>All content posted to Your Account will be deleted if you delete Your Account. Your Account deletion does
                        not automatically delete content that you create collectively with other users which may continue to be
                        visible to other users.</li>
                      <li>Your Content will not be deleted in the following situations:
                        <ol>
                          <li>Where Your Content has been used by others in accordance with the Genuin License and they have not
                            deleted it (in which case the Genuin License will continue to apply until that content is deleted);</li>
                          <li>Where deletion is not possible due to technical limitations of our systems, in which case, we will
                            complete the deletion as soon as technically feasible; or</li>
                          <li>Where immediate deletion would restrict our ability to:
                            <ol type="a" style={paddingStyle}>
                              <li>Investigate or identify illegal activity or violations of the Terms of Service (for example, to
                                identify or investigate misuse of our products or systems);</li>
                              <li>Protect the safety, integrity, and security of the Services, our employees, and users, and to
                                defend ourselves;</li>
                              <li>Comply with legal obligations for the preservation of evidence and to comply with any record
                                keeping obligations required by law; or</li>
                              <li>Comply with a request of a judicial or administrative authority, law enforcement or a government
                                agency; </li>
                            </ol>
                          </li>
                        </ol>
                      </li>
                      <li>In which case, the content will be retained for no longer than is necessary for the purposes for which it
                        has been retained (the exact duration will vary on a case-by-case basis). </li>
                      <li>In each of the above cases, the Genuin License will continue until Your Content has been fully deleted.
                      </li>
                    </ol>
                  </li>
                  <li>Canceling Your Account<ol type="i" style={paddingStyle}>
                    <li>To permanently delete Your Account, go to your profile and click the "settings" button found under your
                      username. From there, click "account" and then "delete account" found at the bottom of the page. </li>
                  </ol>
                  </li>
                </ol>
              </li>
              <li>
                <p style={titleStyle}>Termination or Suspension by Genuin</p>
                <ol type="a" style={paddingStyle}>
                  <li>In some cases we may terminate, suspend or otherwise restrict Your Account and use of the App if we suspect
                    Your Account is connected to suspected violation of these Terms of Service or any applicable agreements or
                    policies, you engage in a Prohibited Use, where required by applicable law, or to otherwise prevent potential
                    loss. Your use of the App is a privilege, and not a right, and we reserve our right to terminate, suspend or
                    restrict your access to the App, as well as take other actions described in these Terms of Service, the Privacy
                    Policy, or any applicable laws and regulations, at any time to protect you, other users and/or us as we deem
                    necessary. You agree that Genuin shall not be liable to you for any permanent or temporary modification of Your
                    Account, or suspension or termination of your access to all or any portion of the Services. Genuin shall reserve
                    the right to keep and use the transaction data or other information related to such accounts. The above account
                    controls may also be applied in the following cases:
                  <ol type="i" style={paddingStyle}>
                    <li>Your Account is subject to a governmental proceeding, criminal investigation or other pending litigation;
                    </li>
                    <li>We detect unusual activities in Your Account;</li>
                    <li>We detect unauthorized access to Your Account; or</li>
                    <li>We are required to do so by a court order or command by a regulatory/government authority.</li>
                  </ol>
                  </li>
                  <li>In case of any of the following events, Genuin shall have the right to directly terminate your access to the
                    App and the Services by cancelling Your Account: <ol type="i" style={paddingStyle}>
                    <li>after Genuin terminates the Services to you;</li>
                    <li>when these Terms of Service are amended, you state your unwillingness to accept the amended Terms of
                        Service by applying for cancellation of Your Account or by other means;</li>
                    <li>you request that the Services be terminated; and</li>
                    <li>any other circumstances where Genuin deems it should terminate the Services.</li>
                  </ol>
                  </li>
                </ol>
              </li>
              <li>
                <p style={titleStyle}>Indemnification; Rights and Remedies</p>
                <ol type="a" style={paddingStyle}>
                  <li>You agree to indemnify and hold harmless Genuin, their affiliates, contractors, licensors, and their
                    respective directors, officers, employees and agents from and against any claims, actions, proceedings,
                    investigations, demands, suits, costs, expenses and damages (including attorneys’ fees, fines or penalties
                    imposed by any regulatory authority) arising out of or related to:<ol type="i" style={paddingStyle}>
                    <li>Your use of, or conduct in connection with the Services;</li>
                    <li>Your breach of or our enforcement of these Terms of Service; or</li>
                    <li>Your violation of any applicable law, regulation, or rights of any third party, including but not limited
                        to infringement of someone’s intellectual property, during your use of the Services. </li>
                  </ol>
                  </li>
                  <li>In the event you are obligated to indemnify Genuin, their affiliates, contractors, licensors, and their
                    respective directors, officers, employees or agents pursuant to these Terms of Service, Genuin will have the
                    right, in its sole discretion, to control any action or proceeding and to determine whether Genuin wishes to
                    settle, and if so, on what terms.</li>
                  <li>You are responsible for all claims, fees, fines, penalties and other liability incurred by Genuin or a third
                    party caused by or arising out of your breach of these Terms of Service or any other User Agreement, and/or your
                    use of the App. You agree to reimburse Genuin or a third party for any and all such liability and any fees and
                    expenses incurred in the event that Genuin must undertake collection efforts to enforce its rights hereunder.
                  </li>
                  <li>If you engage in a Prohibited Use or otherwise violate these Terms of Service or any other User Agreement,
                    including but not limited to chargeback abuse, fraud, money laundering, sale of your Login Credentials, etc., it
                    may be difficult or impractical to calculate our actual damages. You acknowledge and agree that USD $10,000 per
                    violation is a reasonable minimum estimate of Genuin&#39;s actual damages, considering all currently existing
                    circumstances, including the relationship of the sum to the range of harm to Genuin that reasonably could be
                    anticipated, and that Genuin may recover from you and/or directly from Your Account the greater of such amount
                    or the actual damages incurred. </li>
                </ol>
              </li>
              <li>
                <p style={titleStyle}>Disclaimer</p>
                <ol type="a" style={paddingStyle}>
                  <li>THE SERVICES ARE PROVIDED ON AN AS-IS AND AS AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES IS AT
                    YOUR OWN RISK WITHOUT ANY REPRESENTATION OR WARRANTY, WHETHER EXPRESS, IMPLIED OR STATUTORY. WE SPECIFICALLY
                    DISCLAIM, AND YOU WAIVE, ANY AND ALL IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR
                    PURPOSE AND NON-INFRINGEMENT. WE DO NOT MAKE ANY REPRESENTATIONS OR WARRANTIES THAT ACCESS TO ANY PART OF THE
                    APP, OR ANY OF THE MATERIALS CONTAINED THEREIN, WILL BE CONTINUOUS, UNINTERRUPTED, TIMELY, ERROR-FREE, OR
                    SECURE. OPERATION OF THE APP MAY BE INTERFERED WITH BY NUMEROUS FACTORS OUTSIDE OF OUR CONTROL. FURTHER, WE MAKE
                    NO REPRESENTATION OR WARRANTIES AS TO THE QUALITY, SUITABILITY, USEFULNESS, ACCURACY, OR COMPLETENESS OF THE APP
                    OR ANY MATERIALS CONTAINED THEREIN.</li>
                  <li>WE ARE NOT RESPONSIBLE FOR THE ACTIONS, CONTENT, INFORMATION, OR DATA OF THIRD PARTIES, AND YOU RELEASE US,
                    OUR DIRECTORS, OFFICERS, EMPLOYEES, AND AGENTS AND OUR AFFILIATES AND SERVICE PROVIDERS, OR ANY OF THEIR
                    RESPECTIVE OFFICERS, DIRECTORS, AGENTS, JOINT VENTURERS, EMPLOYEES OR REPRESENTATIVES, FROM ANY CLAIMS AND
                    DAMAGES, KNOWN AND UNKNOWN, ARISING OUT OF OR IN ANY WAY CONNECTED WITH ANY CLAIM YOU HAVE AGAINST ANY SUCH
                    THIRD PARTIES.</li>
                  <li>IF YOU ARE A CALIFORNIA RESIDENT, YOU WAIVE CALIFORNIA CIVIL CODE §1542, WHICH SAYS: A GENERAL RELEASE DOES
                    NOT EXTEND TO CLAIMS WHICH THE CREDITOR DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR HER FAVOR AT THE TIME OF
                    EXECUTING THE RELEASE, WHICH IF KNOWN BY HIM OR HER MUST HAVE MATERIALLY AFFECTED HIS OR HER SETTLEMENT WITH THE
                    DEBTOR.</li>
                  <li>NEITHER WE NOR OUR AFFILIATES, SERVICE PROVIDERS, OR OUR OR THEIR RESPECTIVE OFFICERS, DIRECTORS, AGENTS,
                    JOINT VENTURERS, EMPLOYEES OR REPRESENTATIVES WILL BE LIABLE TO YOU FOR ANY LOST PROFITS OR OTHER CONSEQUENTIAL,
                    SPECIAL, INDIRECT, OR INCIDENTAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OF SERVICE OR THE APP,
                    EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR AGGREGATE LIABILITY, AND THAT OF OUR
                    AFFILIATES AND SERVICE PROVIDERS, OR ANY OF OUR OR THEIR RESPECTIVE OFFICERS, DIRECTORS, AGENTS, JOINT
                    VENTURERS, EMPLOYEES OR REPRESENTATIVES, TO YOU OR ANY THIRD PARTIES IN ANY CIRCUMSTANCE IS LIMITED USD $100.00.
                    APPLICABLE LAW MAY NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY OR INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO
                    THE ABOVE LIMITATION OR EXCLUSION MAY NOT APPLY TO YOU. IN SUCH CASES, OUR LIABILITY WILL BE LIMITED TO THE
                    FULLEST EXTENT PERMITTED.</li>
                </ol>
              </li>
              <li>
                <p style={titleStyle}>Disputes</p>
                <ol type="a" style={paddingStyle}>
                  <li>Notice of Claim<ol type="i" style={paddingStyle}>
                    <li>Please contact Genuin first! Genuin wants to address your concerns without resorting to formal legal
                      proceedings, if possible. Genuin will attempt to resolve your dispute internally as soon as possible. The
                      parties agree to negotiate in good faith to resolve the dispute (which discussions shall remain confidential
                      and be subject to applicable rules protecting settlement discussions from use as evidence in any legal
                      proceeding).</li>
                    <li>In the event the dispute cannot be resolved satisfactorily, and you wish to assert a legal claim against
                      Genuin, then you agree to set forth the basis of such claim in writing in a "<b>Notice of
                        Claim</b>," as a form of prior notice to Genuin. The Notice of Claim must: (1) describe the nature
                      and basis of the claim or dispute; (2) set forth the specific relief sought; and (3) include your Genuin
                      account phone number. The Notice of Claim should be submitted to <a style={{ color: 'blue !important', textDecoration: 'underline' }}
                      href="&#x6d;&#97;&#x69;&#x6c;&#116;&#111;&#x3a;&#99;&#111;&#x6e;&#116;&#97;&#99;&#x74;&#x40;&#98;&#101;&#x67;&#101;&#x6e;&#117;&#x69;&#x6e;&#x2e;&#x63;&#x6f;&#x6d;">&#99;&#111;&#x6e;&#116;&#97;&#99;&#x74;&#x40;&#98;&#101;&#x67;&#101;&#x6e;&#117;&#x69;&#x6e;&#x2e;&#x63;&#x6f;&#x6d;</a>.
                      After you have provided the Notice of Claim to Genuin, the dispute referenced in the Notice of Claim may be
                      submitted by either Genuin or you to arbitration in accordance with Subsection (b) of this Section, below.
                      For the avoidance of doubt, the submission of a dispute to Genuin for resolution internally and the delivery
                      of a Notice of Claim to Genuin are prerequisites to commencement of an arbitration proceeding (or any other
                      legal proceeding). During the arbitration, the amount of any settlement offer made by you or Genuin shall
                      not be disclosed to the arbitrator.</li>
                  </ol>
                  </li>
                  <li>Agreement to Arbitrate<ol type="i" style={paddingStyle}>
                    <li>You and Genuin agree that, subject to Subsection (a) above, any dispute, claim, or controversy between you
                      and Genuin arising in connection with or relating in any way to these Terms of Service or to your
                      relationship with Genuin as a user of the Services (whether based in contract, tort, statute, fraud,
                      misrepresentation, or any other legal theory, and whether the claims arise during or after the termination
                      of these Terms of Service) will be determined by mandatory final and binding individual (not class)
                      arbitration. You and Genuin further agree that the arbitration will be administered by the American
                      Arbitration Association ("<b>AAA</b>"), in accordance with the Consumer Arbitration Rules (the
                      &quot;<b>AAA Rules</b>&quot;) then in effect The arbitrator shall have the exclusive power to rule
                      on his or her own jurisdiction, including without limitation any objections with respect to the existence,
                      scope or validity of the agreement to arbitrate, or to the arbitrability of any claim or counterclaim.
                      Arbitration is more informal than a lawsuit in court. THERE IS NO JUDGE OR JURY IN ARBITRATION, AND COURT
                      REVIEW OF AN ARBITRATION AWARD IS LIMITED. There may be more limited discovery than in court. The arbitrator
                      must follow this agreement and can award the same damages and relief as a court (including, if applicable,
                      attorney fees), except that the arbitrator may not award declaratory or injunctive relief in favor of anyone
                      but the parties to the arbitration. The arbitration provisions set forth in this Section will survive
                      termination of these Terms of Service.</li>
                  </ol>
                  </li>
                  <li>Class Action Waiver<ol type="i" style={paddingStyle}>
                    <li>You and Genuin agree that any claims relating to these Terms of Service or to your relationship with
                      Genuin as a user of the Services (whether based in contract, tort, statute, fraud, misrepresentation, or any
                      other legal theory, and whether the claims arise during or after the termination of these Terms of Service)
                      shall be brought against the other party in an arbitration on an individual basis only and not as a
                      plaintiff or class member in a purported class or representative action. You and Genuin further agree to
                      waive any right for such claims to be brought, heard, or arbitrated as a class, collective, representative,
                      or private attorney general action, to the extent permissible by applicable law. Combining or consolidating
                      individual arbitrations into a single arbitration is not permitted without the consent of all parties,
                      including Genuin.</li>
                  </ol>
                  </li>
                </ol>
              </li>
              <li>
                <p style={titleStyle}>Other Matters</p>
                <ol type="a" style={paddingStyle}>
                  <li>Our failure to act with respect to a breach by you or others does not waive our right to act with respect to
                    subsequent or similar breaches. These Terms of Service shall not be construed to waive rights that cannot be
                    waived under applicable consumer protection laws or regulations.</li>
                  <li>Unless otherwise agreed in writing, these Terms of Service, any other agreements and policies (including any
                    applicable User Agreement) sets forth the entire understanding and agreement between you and us as to the
                    subject matter hereof, and supersedes any and all prior discussions, agreements and understandings of any kind
                    (including without limitation any prior versions of the Terms of Service), and of every nature between and among
                    you and us. </li>
                  <li>The Terms of Service, and any rights, obligations and licenses granted hereunder, may not be transferred or
                    assigned by you, but may be assigned by us without notice or restriction, including without limitation to any of
                    our affiliates, parents or subsidiaries, or to any successor in interest. Any attempted transfer or assignment
                    in violation hereof shall be null and void except that, subject to the limits herein, our agreement will bind
                    and inure to the benefit of the parties, their successors and permitted assigns.</li>
                  <li>If any provision of these Terms of Service is held by a court to be invalid or unenforceable, such provision
                    will be changed and interpreted to accomplish the objectives of the provision to the greatest extent possible
                    and any such finding shall not affect the enforceability of any other provision.</li>
                  <li>Except as otherwise expressly provided in these Terms of Service, there are no third-party beneficiaries to
                    these Terms of Service.</li>
                  <li>Provisions herein related to cancellation, general use of the App, disputes, your liability, indemnity and
                    general provisions shall survive any termination of these Terms of Service.</li>
                  <li>Any translation or summary of the App, these Terms of Service and/or policies is provided solely as a
                    convenience and is not intended to modify the App, these Terms of Service, and/or any policies. You agree that
                    the English version of the App, these Terms of Service and/or policies will control in the event of any conflict
                    between the English versions of the App, these Terms of Service and/or policies and any translated versions of
                    the same.</li>
                  <li>You agree that the laws of the State of New York, without regard to principles of conflict of laws, govern
                    these Terms of Service and any claim or dispute between you and us except to the extent governed by U.S. federal
                    law.</li>
                </ol>
              </li>
            </ol>
          </div>
        </Container>
      </section>
      {/* <GetAppModal
        show={showModalAppDownload}
        onClose={handleCloseAppDownload}
      /> */}
      <DownloadAppPopup
        show={showDownloadAppPopup}
        onClose={handleCloseDownloadAppPopup}
      />
    </Layout>
  )
}

export default Terms
