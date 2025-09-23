import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const TermsAndConditions = () => {
    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <Card className="border shadow-sm">
                <CardHeader className="pb-4 pt-6 border-b">
                    <CardTitle className="text-3xl font-bold text-center">Terms and Conditions</CardTitle>
                    <p className="text-center opacity-70">Last Updated: April 20, 2025</p> 
                </CardHeader>

                <CardContent className="p-6">
                    <div className="mb-6">
                        <p>Welcome to CosConnect, a platform that connects cosplay costume lenders with borrowers. These Terms and Conditions govern your use of the CosConnect website and services.</p>
                        <p className="mt-2">By accessing or using our platform, you agree to these Terms. Please read them carefully.</p>
                    </div>

                    <ScrollArea className="h-[500px] pr-4">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-lg font-medium">1. Definitions</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p><strong>"CosConnect"</strong> refers to our platform, website, and services.</p>
                                    <p><strong>"User"</strong> refers to any person who accesses or uses CosConnect, including both Borrowers and Lenders.</p>
                                    <p><strong>"Borrower"</strong> refers to a User who rents or seeks to rent cosplay costumes through CosConnect.</p>
                                    <p><strong>"Lender"</strong> refers to a User who offers cosplay costumes for rent through CosConnect.</p>
                                    <p><strong>"Costume"</strong> refers to any cosplay costume, accessory, or related item offered for rent on CosConnect.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-lg font-medium">2. Account Registration and Verification</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>2.1 <strong>Account Creation</strong>: To use CosConnect as either a Borrower or Lender, you must create an account and provide accurate and complete information.</p>
                                    <p>2.2 <strong>Verification Process</strong>: All users must undergo verification to ensure platform safety:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Borrowers must verify their identity through provided identification documents.</li>
                                        <li>Lenders must undergo a comprehensive verification process, including business verification, identification, and quality checks.</li>
                                    </ul>
                                    <p>2.3 <strong>Admin Review</strong>: The CosConnect team reviews all registration requests before approval. This process may take up to 3 business days.</p>
                                    <p>2.4 <strong>Rejection Rights</strong>: CosConnect reserves the right to reject any registration that does not meet our standards or appears fraudulent.</p>
                                    <p>2.5 <strong>Account Security</strong>: You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-lg font-medium">3. Lender Obligations</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>3.1 <strong>Accurate Listings</strong>: Lenders must provide accurate descriptions, clear photos, sizing information, and condition details for all costumes.</p>
                                    <p>3.2 <strong>Ownership and Rights</strong>: Lenders must have full ownership rights or permission to rent out all costumes listed.</p>
                                    <p>3.3 <strong>Quality Standards</strong>: All costumes must be clean, well-maintained, and safe for use.</p>
                                    <p>3.4 <strong>Communication</strong>: Lenders must respond to inquiries and booking requests in a timely manner.</p>
                                    <p>3.5 <strong>Cancellations</strong>: Lenders who frequently cancel confirmed bookings may face penalties or account suspension.</p>
                                    <p>3.6 <strong>Fees and Payments</strong>: Lenders agree to pay the platform fee for each successful rental transaction.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4">
                                <AccordionTrigger className="text-lg font-medium">4. Borrower Obligations</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>4.1 <strong>Proper Use</strong>: Borrowers must use costumes only for the agreed purpose and handle them with care.</p>
                                    <p>4.2 <strong>Damage Responsibility</strong>: Borrowers are responsible for any damage beyond normal wear and tear.</p>
                                    <p>4.3 <strong>Timely Return</strong>: Borrowers must return costumes by the agreed return date and in the condition received.</p>
                                    <p>4.4 <strong>No Modifications</strong>: Borrowers must not alter, modify, or permanently change any costume without explicit permission.</p>
                                    <p>4.5 <strong>Payment Obligation</strong>: Borrowers agree to pay all rental fees, deposits, and any applicable late or damage fees.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-5">
                                <AccordionTrigger className="text-lg font-medium">5. Rental Process</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>5.1 <strong>Booking</strong>: Rentals begin with a booking request from the Borrower, which must be confirmed by the Lender.</p>
                                    <p>5.2 <strong>Payment</strong>: Full payment is required at the time of booking confirmation.</p>
                                    <p>5.3 <strong>Deposits</strong>: Security deposits may be required and will be refunded after the costume is returned in acceptable condition.</p>
                                    <p>5.4 <strong>Delivery/Pickup</strong>: Costumes may be delivered, shipped, or picked up as agreed between parties.</p>
                                    <p>5.5 <strong>Inspection</strong>: Both parties should inspect and document the costume's condition at pickup/delivery and return.</p>
                                    <p>5.6 <strong>Disputes</strong>: CosConnect provides a dispute resolution process for issues related to damage, late returns, or other concerns.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-6">
                                <AccordionTrigger className="text-lg font-medium">6. Fees and Payments</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>6.1 <strong>Service Fees</strong>: CosConnect charges service fees for both Borrowers and Lenders as outlined in our Fee Schedule.</p>
                                    <p>6.2 <strong>Payment Processing</strong>: All payments are processed through our secure payment system.</p>
                                    <p>6.3 <strong>Refunds</strong>: Refund policies vary based on cancellation timing and circumstances as detailed in our Refund Policy.</p>
                                    <p>6.4 <strong>Taxes</strong>: Users are responsible for applicable taxes related to their rental transactions.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-7">
                                <AccordionTrigger className="text-lg font-medium">7. Prohibited Activities</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>Users are prohibited from:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Providing false or misleading information</li>
                                        <li>Creating multiple accounts</li>
                                        <li>Circumventing the platform's payment system</li>
                                        <li>Harassing or threatening other users</li>
                                        <li>Listing prohibited items (weapons, dangerous materials, etc.)</li>
                                        <li>Using the platform for illegal purposes</li>
                                        <li>Infringing on intellectual property rights</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-8">
                                <AccordionTrigger className="text-lg font-medium">8. Termination</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>8.1 <strong>By User</strong>: You may terminate your account at any time, subject to completing ongoing rental obligations.</p>
                                    <p>8.2 <strong>By CosConnect</strong>: We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or harm the platform community.</p>
                                    <p>8.3 <strong>Effect of Termination</strong>: Upon termination, you will lose access to your account and listings, but remain responsible for pending obligations.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-9">
                                <AccordionTrigger className="text-lg font-medium">9. Liability and Disclaimers</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>9.1 <strong>Platform Role</strong>: CosConnect is a platform connecting Borrowers and Lenders and is not responsible for the quality, safety, or legality of costumes listed.</p>
                                    <p>9.2 <strong>Limitation of Liability</strong>: CosConnect's liability is limited to the fees paid for the specific rental transaction in dispute.</p>
                                    <p>9.3 <strong>No Warranty</strong>: CosConnect provides services "as is" without warranties of any kind.</p>
                                    <p>9.4 <strong>Indemnification</strong>: Users agree to indemnify CosConnect against claims arising from their use of the platform or violations of these Terms.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-10">
                                <AccordionTrigger className="text-lg font-medium">10. Changes to Terms</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>10.1 <strong>Updates</strong>: CosConnect may update these Terms at any time. Continued use after changes constitutes acceptance of updated Terms.</p>
                                    <p>10.2 <strong>Notification</strong>: We will notify users of significant changes via email or platform announcement.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-11">
                                <AccordionTrigger className="text-lg font-medium">11. Governing Law</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.</p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-12">
                                <AccordionTrigger className="text-lg font-medium">12. Contact Information</AccordionTrigger>
                                <AccordionContent className="space-y-2">
                                    <p>For questions or concerns regarding these Terms, please contact us at:</p>
                                    <p className="font-medium">legal@cosconnect.com</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default TermsAndConditions;