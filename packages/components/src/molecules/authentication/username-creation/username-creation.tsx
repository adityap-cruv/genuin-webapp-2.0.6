import { Button } from "@genuin/ui/button";
import { Input } from "@genuin/ui/input";
import { useState } from "react";

export function UsernameCreation() {
    const [username, setUsername] = useState<string>("");

    function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
        setUsername(e.target.value);
    }

    return (
        <div className="gencl:p-12 gencl:rounded-2xl gencl:min-w-xl">
            <div className="gencl:flex gencl:flex-col gencl:gap-3 gencl:text-center">
                <p className="gencl:text-headline-2-semi-bold">Create Username</p>
                <p className="gencl:text-secondary-600">Enter a name to show on your videos</p>
            </div>
            <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:mt-6">
                <div className="gencl:flex gencl:justify-between gencl:text-body-1-medium">
                    <p>Username</p>
                    <p>{username.length}/25</p>
                </div>
                <Input
                    type="email"
                    placeholder="Enter Username here"
                    maxLength={25}
                    value={username}
                    onChange={handleOnChange}
                    className="gencl:rounded-lg gencl:border-secondary-100 gencl:text-secondary-700"
                />
            </div>
            <Button theme="primary" disabled={username.length  <= 0} className="gencl:w-full gencl:mt-6">Continue</Button>
        </div>
    );
}
