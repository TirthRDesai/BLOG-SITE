import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import styles from '../../../styles/DashboardRight.module.css'
import { Textarea } from '@/components/ui/textarea'

function ChangeDataSections({ label, defaultValue, action }) {

    const [isDataChanging, setIsDataChanging] = useState(false)
    const [newValue, setNewValue] = useState("")
    const inpRef = useRef(null)

    useEffect(() => {
        setNewValue(defaultValue)
    }, [defaultValue])


    const changeValue = async () => {
        setIsDataChanging(true)
        if (isDataChanging) {
            const input = inpRef.current
            input.disabled = true
        }
    }

    useEffect(() => {
        if (isDataChanging) {
            async function CallAction() {
                const response = await action(defaultValue, newValue, label)
                const input = inpRef.current
                input.disabled = false
                setIsDataChanging(false)
            }
            const input = inpRef.current
            input.disabled = true
            CallAction()
        }
        else {
            const input = inpRef.current
            input.disabled = false
        }
    }, [isDataChanging, action, defaultValue, newValue, label])

    return (
        <div className='w-full h-fit'>
            <Label htmlFor={label} className='text-[16px] font-normal'>{label}:</Label>
            <div className='w-full h-fit mt-2 border-collapse flex flex-row gap-1.5 items-center justify-between'>
                {
                    label != "Bio" && label != "Password" ?
                        <Input placeholder={"Change " + label} className=' placeholder:text-white text-[#e1e1e1] placeholder:opacity-60 outline-none focus:outline-none focus-visible:ring-0 w-3/4 border-2 border-white' value={newValue} onChange={(e) => setNewValue(e.target.value)} ref={inpRef} />
                        :
                        label != "Password" ?
                            <Textarea
                                placeholder={"Change " + label}
                                className={styles.Textarea + ' placeholder:text-white text-[#e1e1e1] placeholder:opacity-60 outline-none focus:outline-none focus-visible:ring-0 w-3/4 border-2 border-white resize-none'}
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                ref={inpRef}
                            ></Textarea>
                            :
                            <Input placeholder={"Change " + label} className=' placeholder:text-white text-[#e1e1e1] placeholder:opacity-60 outline-none focus:outline-none focus-visible:ring-0 w-3/4 border-2 border-white' type="password" value={newValue} onChange={(e) => { setNewValue(e.target.value) }} ref={inpRef} />

                }
                <div className='w-fit h-full border-collapse'>
                    {
                        isDataChanging ?
                            <Button className='w-[80px]'><span className={styles.loader}></span></Button> :
                            <Button className='w-[80px]' onClick={() => changeValue()}>
                                Change
                            </Button>
                    }
                </div>
            </div>
        </div>
    )
}

export default ChangeDataSections