import { useState } from "react";
import MenuItem from "./MenuItem";
import { SelectScrollableColorMap } from "./ScrollableColorMap";
import { SelectFileType } from "./SelectFileType";
import { Input } from "./ui/input";
import { useGeoData } from "../contexts/GeoDataProvider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export default function MenuArea() {
    const [temp, setTemp] = useState('')
    const { setUrl, setReqInfo, reqInfo } = useGeoData();
    return (
        <div className='bg-white flex-1 my-20 ml-10 rounded-lg min-w-[300px] flex justify-center shadow-xl flex-col gap-5 items-center'>
            <MenuItem name="Data Source">
                <Input type="url" placeholder="URL"
                    onChange={(e) => {
                        setTemp(e.target.value)
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            setUrl(temp);
                        }
                    }}
                />
            </MenuItem>
            <MenuItem name="Color Map">
                <SelectScrollableColorMap />
            </MenuItem>
            <MenuItem name="File Type">
                <SelectFileType />
            </MenuItem>
            <div className="flex items-center w-full space-x-8 justify-between px-6 ">
                <Label htmlFor="rescale">Rescale</Label>
                <Switch id="rescale" checked={reqInfo.rescale} onCheckedChange={() => {
                    setReqInfo((prev) => ({ ...prev, rescale: !prev.rescale }))
                }} />
            </div>
        </div>
    )
}
