import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Upload, X, User, IndianRupee, Camera, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAppContext } from "../context/AppContext";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the form schema with zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  joiningDate: z.date({
    required_error: "Please select a joining date",
  }),
  dailyWage: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, { message: "Daily wage must be at least 1" })
  ),
});

type FormValues = z.infer<typeof formSchema>;

const AddWorkerForm: React.FC = () => {
  const { addWorker, workers } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      joiningDate: new Date(),
      dailyWage: undefined,
    },
  });

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setImageError("Please upload an image file");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be less than 5MB");
      return;
    }
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setProfilePicture(objectUrl);
  };

  // Clear selected image
  const clearImage = () => {
    setProfilePicture(null);
    setImageError(null);
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Check if worker with same name already exists
      const existingWorker = workers.find(worker => 
        worker.name.toLowerCase() === data.name.toLowerCase()
      );
      
      if (existingWorker) {
        toast({
          variant: "destructive",
          title: "Worker already exists",
          description: "A worker with this name already exists.",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Add the new worker
      const newWorker = {
        name: data.name,
        joiningDate: data.joiningDate.toISOString().split('T')[0],
        dailyWage: data.dailyWage,
        profilePicture: profilePicture || undefined,
      };
      
      const newWorkerId = await addWorker(newWorker);
      
      toast({
        title: "Worker added successfully! 🎉",
        description: `${data.name} has been added to your team.`,
      });
      
      // Navigate to the worker's detail page
      navigate(`/workers/${newWorkerId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add worker",
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center">
          <div className="bg-white/20 rounded-xl p-3 mr-4">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Add New Worker</h2>
            <p className="text-purple-100 text-sm">Create a new worker profile for your team</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Picture Upload */}
            <div className="space-y-4">
              <FormLabel className="text-lg font-semibold flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Profile Picture
              </FormLabel>
              <div className="flex flex-col items-center space-y-4">
                {profilePicture ? (
                  <div className="relative">
                    <img 
                      src={profilePicture} 
                      alt="Profile preview" 
                      className="h-32 w-32 rounded-full object-cover border-4 border-purple-200 shadow-lg"
                    />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon"
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 border-4 border-dashed border-gray-300 hover:border-purple-300 transition-colors">
                      <Upload className="h-12 w-12" />
                    </div>
                    <label htmlFor="profilePicture" className="cursor-pointer">
                      <div className="bg-purple-50 hover:bg-purple-100 text-purple-600 px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center">
                        <Camera className="h-4 w-4 mr-2" />
                        Choose Photo
                      </div>
                      <Input
                        type="file"
                        id="profilePicture"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                {imageError && (
                  <Alert variant="destructive" className="max-w-xs">
                    <AlertDescription>{imageError}</AlertDescription>
                  </Alert>
                )}
                <p className="text-sm text-gray-500 text-center max-w-xs">
                  Upload a profile picture (optional). JPG, PNG up to 5MB.
                </p>
              </div>
            </div>

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Worker Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter full name" 
                      className="input-modern h-12 text-lg"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Joining Date Field */}
            <FormField
              control={form.control}
              name="joiningDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-lg font-semibold flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Date of Joining
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "h-12 text-lg px-4 text-left font-normal input-modern",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick joining date</span>
                          )}
                          <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Daily Wage Field */}
            <FormField
              control={form.control}
              name="dailyWage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold flex items-center">
                    <IndianRupee className="h-5 w-5 mr-2" />
                    Daily Wage
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input 
                        type="number" 
                        placeholder="Enter daily wage amount" 
                        className="input-modern h-12 text-lg pl-12"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding Worker...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Add Worker
                </div>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Tips Card */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for adding workers:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use the worker's full name for better identification</li>
          <li>• Set accurate daily wage for proper salary calculations</li>
          <li>• Adding a photo helps in quick recognition</li>
        </ul>
      </div>
    </div>
  );
};

export default AddWorkerForm;