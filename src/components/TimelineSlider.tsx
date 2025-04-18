

// import type React from "react"

// import { useState, useEffect, useRef } from "react"
// import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Eye } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// // Define the event interface
// interface Event {
//   id: string
//   timestamp: string // ISO string
//   temperature: number
//   precipitation: number
//   windSpeed: number
//   description: string
// }

// type TimeScale = "hour" | "day" | "week" | "month"
// type DataPointDensity = "12" | "24" | "48" | "72"

// export default function TimelineSlider() {
//   // Sample events data - in a real app, this would come from an API
//   const [allEvents, setAllEvents] = useState<Event[]>(() => generateSampleEvents())
//   const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
//   const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
//   const [currentDateTime, setCurrentDateTime] = useState(new Date(2025, 2, 25, 14, 30)) // March 11, 2025, 14:30
//   const [isDragging, setIsDragging] = useState(false)
//   const [sliderPosition, setSliderPosition] = useState(50) // Percentage position
//   const [timeScale, setTimeScale] = useState<TimeScale>("day")
//   const [dataPointDensity, setDataPointDensity] = useState<DataPointDensity>("48")
//   const sliderRef = useRef<HTMLDivElement>(null)
//   const options=["DAY","MONTH","YEAR"];
//   const [selectedOption,setSelectedOption]=useState(options[0])
//   // Generate sample events data
//   function generateSampleEvents(): Event[] {
//     const events: Event[] = []
//     const baseDate = new Date(2025, 2, 23) 
//     const endDate = new Date(2025, 2, 25) 

//     // Generate random events throughout the year
//     const totalEvents = 500
//     for (let i = 0; i < totalEvents; i++) {
//       const randomTime = baseDate.getTime() + Math.random() * (endDate.getTime() - baseDate.getTime())
//       const eventDate = new Date(randomTime)

//       events.push({
//         id: `event-${i}`,
//         timestamp: eventDate.toISOString(),
//         temperature: Math.floor(Math.random() * 30) + 5, // 5-35
//         precipitation: Math.floor(Math.random() * 100), // 0-100
//         windSpeed: Math.floor(Math.random() * 50), // 0-50
//         description: `Weather event ${i}`,
//       })
//     }

//     // Sort events by timestamp
//     return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
//   }

//   // Filter events based on current date and time scale
//   useEffect(() => {
//     const numPoints = Number.parseInt(dataPointDensity)
//     const startDateTime = new Date(currentDateTime)
//     const endDateTime = new Date(currentDateTime)

//     // Adjust date range based on time scale and data point density
//     if (timeScale === "hour") {
//       startDateTime.setHours(startDateTime.getHours() - numPoints / 2)
//       endDateTime.setHours(endDateTime.getHours() + numPoints / 2)
//     } else if (timeScale === "day") {
//       startDateTime.setDate(startDateTime.getDate() - numPoints / 2)
//       endDateTime.setDate(endDateTime.getDate() + numPoints / 2)
//     } else if (timeScale === "week") {
//       startDateTime.setDate(startDateTime.getDate() - (numPoints / 2) * 7)
//       endDateTime.setDate(endDateTime.getDate() + (numPoints / 2) * 7)
//     } else if (timeScale === "month") {
//       startDateTime.setMonth(startDateTime.getMonth() - numPoints / 2)
//       endDateTime.setMonth(endDateTime.getMonth() + numPoints / 2)
//     }

//     // Filter events within the date range


//     // If we have too many events, sample them to match the desired density
//     let result = allEvents
//     if (allEvents.length > numPoints) {
//       const step = Math.floor(allEvents.length / numPoints)
//       result = allEvents.filter((_, index) => index % step === 0).slice(0, numPoints)
//     }

//     setFilteredEvents(result)

//     // Find and select the closest event to current time
//     if (result.length > 0) {
//       const closestEvent = findClosestEvent(currentDateTime, result)
//       setSelectedEvent(closestEvent)

//       // Update slider position based on the selected event
//       const eventIndex = result.findIndex((e) => e.id === closestEvent.id)
//       if (eventIndex >= 0) {
//         setSliderPosition((eventIndex / (result.length - 1)) * 100)
//       }
//     } else {
//       setSelectedEvent(null)
//     }

//     console.log(currentDateTime)
//   }, [currentDateTime, timeScale, dataPointDensity, allEvents])

//   // Find the closest event to a given datetime
//   const findClosestEvent = (targetTime: Date, events: Event[] = filteredEvents): Event => {
//     if (events.length === 0) return null!

//     return events.reduce((closest, current) => {
//       const currentDiff = Math.abs(new Date(current.timestamp).getTime() - targetTime.getTime())
//       const closestDiff = Math.abs(new Date(closest.timestamp).getTime() - targetTime.getTime())
//       return currentDiff < closestDiff ? current : closest
//     })
//   }

//   // Handle time navigation based on current scale
//   const changeTime = (amount: number) => {
//     const newDateTime = new Date(currentDateTime)

//     if (timeScale === "hour") {
//       newDateTime.setHours(currentDateTime.getHours() + amount)
//     } else if (timeScale === "day") {
//       newDateTime.setDate(currentDateTime.getDate() + amount)
//     } else if (timeScale === "week") {
//       newDateTime.setDate(currentDateTime.getDate() + amount * 7)
//     } else if (timeScale === "month") {
//       newDateTime.setMonth(currentDateTime.getMonth() + amount)
//     }

//     setCurrentDateTime(newDateTime)
//   }

//   // Handle minute navigation
//   const changeMinute = (amount: number) => {
//     const newDateTime = new Date(currentDateTime)
//     newDateTime.setMinutes(currentDateTime.getMinutes() + amount)
//     setCurrentDateTime(newDateTime)
//   }

//   // Handle hour navigation
//   const changeHour = (amount: number) => {
//     const newDateTime = new Date(currentDateTime)
//     newDateTime.setHours(currentDateTime.getHours() + amount)
//     setCurrentDateTime(newDateTime)
//   }

//   // Handle slider drag
//   const handleMouseDown = (e: React.MouseEvent) => {
//     setIsDragging(true)
//   }

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!isDragging || !sliderRef.current || filteredEvents.length === 0) return

//     const sliderRect = sliderRef.current.getBoundingClientRect()
//     const sliderWidth = sliderRect.width
//     const offsetX = e.clientX - sliderRect.left

//     // Calculate new position as percentage
//     let newPosition = (offsetX / sliderWidth) * 100
//     newPosition = Math.max(0, Math.min(100, newPosition))

//     setSliderPosition(newPosition)

//     // Find the closest event to the slider position
//     const eventIndex = Math.round((newPosition / 100) * (filteredEvents.length - 1))
//     if (eventIndex >= 0 && eventIndex < filteredEvents.length) {
//       const event = filteredEvents[eventIndex]
//       setSelectedEvent(event)
//       setCurrentDateTime(new Date(event.timestamp))
//     }
//   }

//   const handleMouseUp = () => {
//     setIsDragging(false)
//   }

//   // Add event listeners for mouse up outside the component
//   useEffect(() => {
//     const handleGlobalMouseUp = () => {
//       setIsDragging(false)
//     }

//     window.addEventListener("mouseup", handleGlobalMouseUp)
//     return () => {
//       window.removeEventListener("mouseup", handleGlobalMouseUp)
//     }
//   }, [])

//   // Format datetime for display
//   const formatDateTime = (datetime: Date) => {
//     const year = datetime.getFullYear()
//     const month = datetime.toLocaleString("en-US", { month: "short" }).toUpperCase()
//     const day = datetime.getDate()
//     const hour = datetime.getHours().toString().padStart(2, "0")
//     const minute = datetime.getMinutes().toString().padStart(2, "0")
//     return { year, month, day, hour, minute }
//   }

//   const { year, month, day, hour, minute } = formatDateTime(currentDateTime)

//   // Generate tick marks for the timeline based on events
//   const generateTicks = () => {
//     if (filteredEvents.length === 0) return null

//     return filteredEvents.map((event, index) => {
//       const position = (index / (filteredEvents.length - 1)) * 100
//       const isSelected = selectedEvent?.id === event.id

//       return (
//         <div
//           key={event.id}
//           className={cn("absolute top-0 w-px", isSelected ? "bg-primary h-full" : "bg-white/70 h-3")}
//           style={{ left: `${position}%` }}
//         />
//       )
//     })
//   }

//   // Generate time labels for the timeline
//   const generateTimeLabels = () => {
//     if (filteredEvents.length === 0) return null

//     // Determine how many labels to show based on available space
//     const numLabels = Math.min(5, filteredEvents.length)
//     const step = Math.max(1, Math.floor(filteredEvents.length / (numLabels - 1)))

//     const labels = []
//     for (let i = 0; i < filteredEvents.length; i += step) {
//       if (labels.length >= numLabels) break

//       const event = filteredEvents[i]
//       const datetime = new Date(event.timestamp)
//       let label = ""

//       if (timeScale === "hour") {
//         label = `${datetime.getHours().toString().padStart(2, "0")}:${datetime.getMinutes().toString().padStart(2, "0")}`
//       } else if (timeScale === "day") {
//         label = `${datetime.getHours().toString().padStart(2, "0")}:${datetime.getMinutes().toString().padStart(2, "0")}`
//       } else if (timeScale === "week" || timeScale === "month") {
//         label = `${datetime.toLocaleString("en-US", { month: "short" })} ${datetime.getDate()}`
//       }

//       labels.push(
//         <div
//           key={i}
//           className="absolute font-medium text-xs"
//           style={{
//             left: `${(i / (filteredEvents.length - 1)) * 100}%`,
//             transform: "translateX(-50%)",
//           }}
//         >
//           {label}
//         </div>,
//       )
//     }

//     return labels
//   }

//   // Handle density change
//   const handleDensityChange = (value: string) => {
//     if (!value) return
//     setDataPointDensity(value as DataPointDensity)
//   }

//   // Handle time scale change
//   const handleTimeScaleChange = (value: string) => {
//     setTimeScale(value as TimeScale)
//   }

//   return (
//     <div className="bottom-5 absolute w-full select-none" >

//     <div className="flex flex-col w-full max-w-7xl mx-auto ">
//       {/* Map-like background for visual effect */}
     
//       <div className="mt-4  rounded-lg p-4 text-white">
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <div className="flex items-center gap-4">
//             <div>
//               <span className="text-sm mr-2">Data Points:</span>
//               <ToggleGroup type="single" value={dataPointDensity} onValueChange={handleDensityChange}>
//                 <ToggleGroupItem value="12" className="px-3 py-1">
//                   12
//                 </ToggleGroupItem>
//                 <ToggleGroupItem value="24" className="px-3 py-1">
//                   24
//                 </ToggleGroupItem>
//                 <ToggleGroupItem value="48" className="px-3 py-1">
//                   48
//                 </ToggleGroupItem>
//                 <ToggleGroupItem value="72" className="px-3 py-1">
//                   72
//                 </ToggleGroupItem>
//               </ToggleGroup>
//             </div>

            
//           </div>

//           <div className="text-sm">{filteredEvents.length} events in view</div>
//         </div>
//       </div>

//       {/* Timeline slider component */}
//       <div className="bg-foreground rounded-lg p-4 text-white">
//         <div className="grid grid-cols-5 items-center">
//           {/* Time selector */}
//           <div className="flex col-span-1">

//           <div className="grid grid-cols-3  items-center space-x-1 mr-4">
//             <div className="flex flex-col items-center">
//               <ChevronUp className="cursor-pointer hover:text-primary" onClick={() => changeTime(365)} />
//                 <input className="bg-transparent cursor-pointer hover:text-primary text-base text-nowrap font-bold w-full items-center text-center" value={year}>
//                 </input>
//               {/* <div className="text-base text-nowrap font-bold">{year}</div> */}
//               <ChevronDown className="cursor-pointer hover:text-primary" onClick={() => changeTime(-365)} />
//             </div>

//             <div className="flex flex-col items-center">
//               <ChevronUp className="cursor-pointer hover:text-primary" onClick={() => changeTime(30)} />
//               <input className="bg-transparent cursor-pointer hover:text-primary text-base text-nowrap font-bold w-full items-center text-center" value={month}/>

//               {/* <div className="text-base text-nowrap font-bold">
//                 {month} 
//               </div> */}
//               <ChevronDown className="cursor-pointer hover:text-primary" onClick={() => changeTime(-30)} />
//             </div>
//             <div className="flex flex-col items-center">
//               <ChevronUp className="cursor-pointer hover:text-primary" onClick={() => changeHour(24)} />
//               {/* <div className="text-base text-nowrap font-bold">{String(day).padStart(2,"0")}</div> */}
//               <input className="bg-transparent cursor-pointer hover:text-primary text-base text-nowrap font-bold w-full items-center text-center" value={String(day).padStart(2,"0")}/>

//               <ChevronDown className="cursor-pointer hover:text-primary" onClick={() => changeHour(-24)} />
//             </div>

//             {/* 

//             <div className="flex flex-col items-center">
//               <ChevronUp className="cursor-pointer hover:text-primary" onClick={() => changeMinute(5)} />
//               <div className="text-base text-nowrap font-bold">{minute}</div>
//               <ChevronDown className="cursor-pointer hover:text-primary" onClick={() => changeMinute(-5)} />
//             </div> */}
//           </div>

//           <div className="flex  items-center">
//             <ChevronLeft className="text-base cursor-pointer hover:text-primary " onClick={() => changeTime(-1)} />
//               <div className="text-xs font-semibold hover:text-primary focus:text-primary" onClick={()=>{
//                 // options.find(selectedOption)
//                 // setSelectedEvent("")
//               }}> 
//               {selectedOption}
//               </div>
//             <ChevronRight className="text-2xl cursor-pointer hover:text-primary" onClick={() => changeTime(1)} />
//           </div>    
//           </div>

//           {/* Timeline slider */}
//           <div className="col-span-4 flex items-center">

      
//           <div
//             ref={sliderRef}
//             className="relative flex-1 h-12 mx-4 cursor-pointer "
//             onMouseDown={handleMouseDown}
//             onMouseMove={handleMouseMove}
//             onMouseUp={handleMouseUp}
//           >
//             <div className="absolute inset-0 flex items-center">
//               <div className="relative w-full h-8 rounded-md ">
//                 {/* Event tick marks */}
//                 {generateTicks()}

//                 {/* Time labels */}
//                 <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-xs pointer-events-none select-none">
//                   {generateTimeLabels()}
//                 </div>

//                 {/* Slider handle */}
//                 {selectedEvent && (
//                   <div
//                     className="absolute top-0 h-full w-1 bg-white"
//                     style={{
//                       left: `${sliderPosition}%`,
//                       transition: isDragging ? "none" : "left 0.2s ease-out",
//                     }}
//                   />
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center ml-2">

//             <Eye className="ml-4 cursor-pointer hover:text-primary" />
//           </div> 
//              </div>
//         </div>
//       </div>
//     </div>
//     </div>

//   )
// }
