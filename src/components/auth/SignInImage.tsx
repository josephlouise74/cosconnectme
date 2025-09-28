import Image from 'next/image';

export function SignInImage() {
    return (
        <div className="hidden lg:block relative bg-muted w-full h-full">
            <div className="relative w-full h-full">
                <Image
                    src={"https://rlfkmbjptciiluhsbvxx.supabase.co/storage/v1/object/public/images//chris-winchester-nttQtY1-Osg-unsplash.jpg"}
                    alt="Sign In Illustration"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-opacity duration-300 opacity-0"
                    priority
                    quality={90}
                    loading="eager"
                    onLoadingComplete={(img) => {
                        img.classList.remove("opacity-0");
                        img.classList.add("opacity-100");
                    }}
                />
            </div>
        </div>
    );
}
