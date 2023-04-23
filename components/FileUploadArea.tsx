import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadAreaProps {
  setFiles: (files: any) => void;
  isUploading: boolean;
  handleFileUpload: () => void;
  files: any;
  maxFileSizeMB: number;
  maxNumFiles: number;
}

export function FileUploadArea({
  setFiles,
  isUploading,
  handleFileUpload,
  files,
  maxFileSizeMB,
  maxNumFiles,
}: FileUploadAreaProps) {
  console.log('files', files);

  const { toast } = useToast();
  const onDrop = useCallback((acceptedFiles: any, fileRejections: any) => {
    if (fileRejections.length > 0) {
      switch (fileRejections[0].errors[0].code) {
        case 'file-too-large':
          toast({
            title: 'File size too large',
            description: `Please upload file(s) smaller than ${maxFileSizeMB}MB`,
            variant: 'destructive',
          });
          break;
        case 'too-many-files':
          toast({
            title: 'Too many files',
            description: `Please upload a maximum of ${maxNumFiles} files`,
            variant: 'destructive',
          });
          break;
        case 'file-invalid-type':
          toast({
            title: 'Invalid file type',
            description: 'Please upload a valid file type',
            variant: 'destructive',
          });
          break;
        default:
          toast({
            title: 'Error',
            description: 'Please try again',
            variant: 'destructive',
          });
          break;
      }
    } else {
      setFiles(acceptedFiles);
    }
  }, []);

  const maxFileSize = maxFileSizeMB * 1024 * 1024;

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        'application/pdf': ['.pdf'],
        'text/plain': ['.txt', '.md'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          ['.docx'],
        'text/csv': ['.csv'],
      },
      maxFiles: maxNumFiles,
      maxSize: maxFileSize,
      validator: (file: any) => {
        console.log('file size', file);
        if (file.size > maxFileSize) {
          return {
            code: 'file-too-large',
            message: `File is too large, total max size allowed is ${maxFileSizeMB}MB`,
          };
        }
        return null;
      },
    });

  /**
   * Uncomment this to see the fileRejectionItems for debugging
   */
  // const fileRejectionItems = fileRejections.map(({ file, errors }) => {
  //   console.log('file', file);

  //   return (
  //     <li key={file.path}>
  //       {file.path} - {file.size} bytes
  //       <ul>
  //         {errors.map((e) => (
  //           <li key={e.code}>
  //             {e.message}
  //             {e.code}
  //           </li>
  //         ))}
  //       </ul>
  //     </li>
  //   );
  // });

  return (
    <div className="flex flex-col items-start gap-2 min-w-[400px]">
      <h2 className="mt-10 scroll-m-20 pb-2 text-lg font-semibold tracking-tight transition-colors first:mt-0">
        Upload one or more files
      </h2>
      <div
        className="w-full rounded-md border border-slate-200 p-0 dark:border-slate-700"
        {...getRootProps()}
      >
        {/* <h4>{fileRejectionItems}</h4> */}
        <div className="flex min-h-[150px] cursor-pointer items-center justify-center p-10 hover:bg-gray-100">
          <input {...getInputProps()} />
          {files ? (
            <ul>
              {files.map((file: any) => (
                <li key={file.name} className="space-y-2">
                  *{file.name}*
                </li>
              ))}
            </ul>
          ) : (
            <>
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>
                  Drag and drop file(s) here, or click to select files.
                  <br />
                  Accepts .pdf, .txt, .md, .docx, .csv, .json
                  <br></br>(max 3 files & 4MB total upload size)
                </p>
              )}
            </>
          )}
        </div>
      </div>
      <Button
        type="button"
        onClick={handleFileUpload}
        disabled={
          !files || isUploading
          // hasMissingCredentials()
        }
      >
        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Upload
      </Button>
    </div>
  );
}
