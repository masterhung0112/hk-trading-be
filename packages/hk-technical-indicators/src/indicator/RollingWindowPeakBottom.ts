/**
 * This function identifies regional peaks and bottoms of a price series with a RW of size 2w+1, 
 * and a slide step of one observation.
 * @param ys: Price series (Column Vector).
 * @param w: Is used to define the size of the RW, which is 2w+1
 * @param pflag: If1, this function generate a plot
 * @return [peaks, bottom] 
 *  peak: An (n×2) matrix containing the coordinates of the n identified peaks.
 *  bottom: A (k×2) matrix containing the coordinates of the k identified bottoms.
 *          The first and second column of these outputs contains the y- and x-coordinates respectively.
 */
export function RollingWindowPeakBottom() {

}