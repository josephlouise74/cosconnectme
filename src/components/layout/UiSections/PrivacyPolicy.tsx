import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

const PrivacyPolicy = () => {
    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <Card className="border shadow-sm">
                <CardHeader className="pb-4 pt-6 border-b">
                    <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
                    <p className="text-center opacity-70">Last Updated: April 20, 2025</p>
                </CardHeader>

                <CardContent className="p-6">
                    <div className="mb-6">
                        <p>At CosConnect, we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
                        <p className="mt-2">Please read this Privacy Policy carefully. By using CosConnect, you consent to the collection and use of information as described here.</p>
                    </div>

                    <ScrollArea className="h-[500px] pr-4">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-lg font-medium">1. Information We Collect</AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>We collect the following types of information:</p>

                                    <div>
                                        <h4 className="font-medium">1.1 Personal Information</h4>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Contact information (name, email address, phone number)</li>
                                            <li>Account credentials (username, password)</li>
                                            <li>Profile information (profile picture, bio)</li>
                                            <li>Payment information (processed securely through our payment providers)</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-medium">1.2 Verification Information</h4>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Identification documents (ID cards, driver's licenses, passports)</li>
                                            <li>Business verification documents (business permits, registration information)</li>
                                            <li>Address verification information</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-medium">1.3 Costume Information</h4>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Pictures and descriptions of costumes</li>
                                            <li>Pricing and availability information</li>
                                            <li>Size, condition, and component details</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-medium">1.4 Usage Information</h4>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Device information (type, operating system, browser)</li>
                                            <li>Log data (IP address, access times, pages viewed)</li>
                                            <li>Transaction history</li>
                                            <li>Communication records within the platform</li>
                                        </ul>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-lg font-medium">2. How We Use Your Information</AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>We use your information for the following purposes:</p>

                                    <div>
                                        <h4 className="font-medium">2.1 To Provide and Improve Our Services</h4>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Facilitate costume rentals between Lenders and Borrowers</li>
                                            <li>Process payments and manage transactions</li>
                                            <li>Verify user identities and credentials</li>
                                            <li>Improve platform features and user experience</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-medium">2.2 Communication</h4>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Send important notifications about rentals and transactions</li>
                                            <li>Provide customer support and respond to inquiries</li>
                                            <li>Send administrative messages about platform updates or policy changes</li>
                                            <li>Send promotional communications (with your consent)</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-medium">2.3 Safety and Security</h4>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Verify identities to prevent fraud</li>
                                            <li>Monitor for suspicious or prohibited activities</li>
                                            <li>Protect the rights and safety of users and third parties</li>
                                            <li>Enforce our Terms and Conditions</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-medium">2.4 Legal Compliance</h4>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Comply with applicable laws and regulations</li>
                                            <li>Respond to legal requests and prevent harm</li>
                                            <li>Establish, exercise, or defend legal claims</li>
                                        </ul>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-lg font-medium">3. Verification Processes</AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>We implement thorough verification processes to ensure platform safety:</p>

                                    <div>
                                        <h4 className="font-medium">3.1 User Verification</h4>
                                        <p>All users undergo identity verification to confirm their authenticity. This helps build trust and safety within our community.</p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium">3.2 Lender Verification</h4>
                                        <p>Lenders undergo additional verification, including:</p>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Business documentation review</li>
                                            <li>Identity document verification</li>
                                            <li>Quality assessment of listed costumes</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-medium">3.3 Verification Data Storage</h4>
                                        <p>Verification information is stored securely and is only accessible to authorized personnel for verification purposes. This information is retained for as long as necessary to fulfill verification requirements and legal obligations.</p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4">
                                <AccordionTrigger className="text-lg font-medium">4. Information Sharing</AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>We may share your information with:</p>

                                    <div>
                                        <h4 className="font-medium">4.1 Other Users</h4>
                                        <p>When necessary to facilitate rentals. For example:</p>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Lenders see Borrowers' names and contact information for rental coordination</li>
                                            <li>Borrowers see Lenders' business information and contact details</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-medium">4.2 Service Providers</h4>
                                        <p>Third-party vendors who perform services on our behalf, such as:</p>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>Payment processors</li>
                                            <li>Identity verification services</li>
                                            <li>Cloud hosting providers</li>
                                            <li>Customer support tools</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-medium">4.3 Legal Requirements</h4>
                                        <p>We may disclose information:</p>
                                        <ul className="list-disc pl-6 space-y-1">
                                            <li>In response to valid legal requests</li>
                                            <li>To comply with applicable laws</li>
                                            <li>To protect rights, privacy, safety, or property</li>
                                            <li>In connection with a merger, acquisition, or business transfer</li>
                                        </ul>
                                    </div>

                                    <p>We do not sell your personal information to third parties.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-5">
                                <AccordionTrigger className="text-lg font-medium">5. Data Security</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>We implement appropriate technical and organizational measures to protect your personal information, including:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Encryption of sensitive information</li>
                                        <li>Regular security assessments</li>
                                        <li>Access controls and authentication measures</li>
                                        <li>Secure data storage practices</li>
                                    </ul>
                                    <p>However, no method of transmission or storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-6">
                                <AccordionTrigger className="text-lg font-medium">6. Data Retention</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>We retain your information for as long as necessary to:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Provide our services to you</li>
                                        <li>Comply with legal obligations</li>
                                        <li>Resolve disputes</li>
                                        <li>Enforce our agreements</li>
                                    </ul>
                                    <p>When your information is no longer needed for these purposes, we will securely delete or anonymize it.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-7">
                                <AccordionTrigger className="text-lg font-medium">7. Your Rights and Choices</AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    <p>Depending on your location, you may have the following rights:</p>

                                    <div>
                                        <h4 className="font-medium">7.1 Access and Portability</h4>
                                        <p>You can request a copy of your personal information and, where technically feasible, receive it in a structured, commonly used format.</p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium">7.2 Correction</h4>
                                        <p>You can update or correct inaccurate information through your account settings or by contacting us.</p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium">7.3 Deletion</h4>
                                        <p>You can request deletion of your personal information, subject to certain exceptions.</p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium">7.4 Objection and Restriction</h4>
                                        <p>You can object to certain processing of your information or request that we restrict processing.</p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium">7.5 Marketing Preferences</h4>
                                        <p>You can opt out of marketing communications at any time by using the unsubscribe link in our emails or adjusting your account settings.</p>
                                    </div>

                                    <p>To exercise these rights, please contact us at privacy@cosconnect.com. We will respond to your request within the timeframe required by applicable law.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-8">
                                <AccordionTrigger className="text-lg font-medium">8. Children's Privacy</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>CosConnect is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us, and we will delete such information.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-9">
                                <AccordionTrigger className="text-lg font-medium">9. International Data Transfers</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>We may transfer your information to countries other than your country of residence. When we do so, we implement appropriate safeguards to protect your information in accordance with this Privacy Policy and applicable law.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-10">
                                <AccordionTrigger className="text-lg font-medium">10. Changes to this Privacy Policy</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes through the platform or via email. Your continued use of CosConnect after such modifications constitutes your acceptance of the updated Privacy Policy.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-11">
                                <AccordionTrigger className="text-lg font-medium">11. Contact Us</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>If you have questions or concerns about this Privacy Policy or our privacy practices, please contact us at:</p>
                                    <p className="font-medium">privacy@cosconnect.com</p>
                                    <p>CosConnect Privacy Team<br />
                                        [Your Physical Address]<br />
                                        [City, State/Province, Postal Code]<br />
                                        [Country]</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default PrivacyPolicy;