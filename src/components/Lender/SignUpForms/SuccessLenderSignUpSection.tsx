import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CheckCircle, Clock, Mail, Shield } from 'lucide-react';
import Link from 'next/link';

const SuccessLenderSignUpSection = () => {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12 ">
            <Card className="max-w-2xl w-full shadow-lg">
                <CardHeader className="flex flex-col items-center space-y-2 pb-2 pt-6">
                    <div className="h-20 w-20 rounded-full  flex items-center justify-center mb-2">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-center">Registration Successful!</h1>
                    <p className="text-gray-500 text-center">Thank you for registering as a lender with CosConnect</p>
                </CardHeader>

                <CardContent className="p-6 space-y-8">
                    <div className="p-4 rounded-lg border ">
                        <h2 className="text-xl font-semibold text-rose-800 mb-2">Verification in Progress</h2>
                        <p className="">
                            Your account is currently pending verification by our admin team. We need to verify your information before activating your lender account.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className=" p-2 rounded-full">
                                <Clock className="h-6 w-6 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-lg">Verification Timeline</h3>
                                <p className="text-gray-600">The verification process typically takes up to 3 business days. We appreciate your patience during this time.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className=" p-2 rounded-full">
                                <Mail className="h-6 w-6 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-lg">Next Steps</h3>
                                <p className="text-gray-600">You'll receive an email from the CosConnect team with your verification status. Please check your inbox regularly, including spam folders.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className=" p-2 rounded-full">
                                <Shield className="h-6 w-6 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-lg">Verification Criteria</h3>
                                <p className="text-gray-600">Our team will verify the business information and documentation you've provided to ensure it meets our platform standards.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border  rounded-lg p-4">
                        <h3 className="font-medium mb-2 text-rose-600">What happens next?</h3>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                            <li>If approved, you'll receive login credentials to access your lender dashboard</li>
                            <li>If additional information is needed, we'll contact you via email</li>
                            <li>If rejected, we'll provide detailed feedback on why and how you can reapply</li>
                        </ul>
                    </div>

                    <div className="text-center space-y-4 pt-4">
                        <p className="text-gray-600">Have questions? Contact our support team at <span className="font-medium">support@cosconnect.com</span></p>

                        <Link href="/" passHref>
                            <Button className="px-8 cursor-pointer">
                                Return to Homepage
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SuccessLenderSignUpSection;