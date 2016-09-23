package getthedobbetweencertianyear;

import java.util.Date;
import java.util.Random;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;

public class getDoB {
	public static void main(String[] args) {		
		String dob = getDOBfun(24);
		System.out.println(dob);
	    Random rand = new Random();
	    String DUMMY_EMAIL_ADDRESS = "student+dummy_" + System.currentTimeMillis() + rand.nextInt(Integer.MAX_VALUE) + "@email.amazon.com";
		System.out.println(DUMMY_EMAIL_ADDRESS);
	}
	
	static String getDOBfun(int age){
		
		DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		Calendar cal = Calendar.getInstance();
		age = -age;
		cal.add(Calendar.YEAR, age); // to get previous year add -1
		Date dob = cal.getTime();
		//System.out.println(dateFormat.format(dob).split("/")[0]);
		//System.out.println(dateFormat.format(dob).split("/")[1]);
		//System.out.println(dateFormat.format(dob).split("/")[2]);	
		return dateFormat.format(dob);				
	}	

}
